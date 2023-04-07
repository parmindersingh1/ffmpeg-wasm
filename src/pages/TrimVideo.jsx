import { useEffect, useRef, useState } from "react";
import "./../App.css";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {  createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const ffmpeg = createFFmpeg({ log: true });

//Convert the time obtained from the video to HH:MM:SS format
const convertToHHMMSS = (val) => {
  const secNum = parseInt(val, 10);
  let hours = Math.floor(secNum / 3600);
  let minutes = Math.floor((secNum - hours * 3600) / 60);
  let seconds = secNum - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  let time;
  // only mm:ss
  if (hours === "00") {
    time = minutes + ":" + seconds;
  } else {
    time = hours + ":" + minutes + ":" + seconds;
  }
  return time;
};

function TrimVideo() {
  const [videoDuration, setVideoDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [endTime, setEndTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [trimedVideo, setTrimedVideo] = useState();
  const videoRef = useRef();
  let initialSliderValue = 0;

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    load();
    return () => {
      ffmpeg.exit();
    };
  }, []);
  //Get the duration of the video using videoRef
  useEffect(() => {
    if (videoRef && videoRef.current) {
      const currentVideo = videoRef.current;
      currentVideo.onloadedmetadata = () => {
        setVideoDuration(currentVideo.duration);
        setEndTime(currentVideo.duration);
      };
    }
  }, [video]);

  //Called when handle of the nouislider is being dragged
  const updateOnSliderChange = (values, handle) => {
    setTrimedVideo("");
    let readValue;
    if (handle) {
      readValue = values[handle] | 0;
      if (endTime !== readValue) {
        setEndTime(readValue);
      }
    } else {
      readValue = values[handle] | 0;
      if (initialSliderValue !== readValue) {
        initialSliderValue = readValue;
        if (videoRef && videoRef.current) {
          videoRef.current.currentTime = readValue;
          setStartTime(readValue);
        }
      }
    }
  };

  //Play the video when the button is clicked
  const handlePlay = () => {
    if (videoRef && videoRef.current) {
      videoRef.current.play();
    }
  };

  //Pause the video when then the endTime matches the currentTime of the playing video
  const handlePauseVideo = (e) => {
    const currentTime = Math.floor(e.currentTarget.currentTime);

    if (currentTime === endTime) {
      e.currentTarget.pause();
    }
  };

  //Trim functionality of the video
  const handleTrim = async () => {
    const { name, type } = video;
    //Write video to memory
    ffmpeg.FS("writeFile", name, await fetchFile(video));
    const videoFileType = type.split("/")[1];
    //Run the ffmpeg command to trim video
    await ffmpeg.run(
      "-i",
      name,
      "-ss",
      `${convertToHHMMSS(startTime)}`,
      "-to",
      `${convertToHHMMSS(endTime)}`,
      "-acodec",
      "copy",
      "-vcodec",
      "copy",
      `out.${videoFileType}`
    );
    //Convert data to url and store in videoTrimmedUrl state
    const data = ffmpeg.FS("readFile", `out.${videoFileType}`);
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: video.type })
    );
    setTrimedVideo(url);
  };

  return ready ? (
    <div className="App">
      <input type="file" onChange={(e) => setVideo(e.target.files?.item(0))} />

      {video && (
        <>
          <video
            controls
            width="250"
            ref={videoRef}
            src={URL.createObjectURL(video)}
            onTimeUpdate={handlePauseVideo}
          ></video>
          {/* //   <video
        //     src={trimedVideo}
        //     ref={videoRef}
        //     onTimeUpdate={handlePauseVideo}
        //   >
        //     <source src={trimedVideo} type={video.type} />
        //   </video> */}
          <br />
          <Nouislider
            behaviour="tap-drag"
            step={1}
            margin={3}
            limit={30}
            range={{ min: 0, max: videoDuration || 2 }}
            start={[0, videoDuration || 2]}
            connect
            onUpdate={updateOnSliderChange}
          />
          <br />
          Start duration: {convertToHHMMSS(startTime)} &nbsp; End duration:{" "}
          {convertToHHMMSS(endTime)}
          <br />
          <button onClick={handlePlay}>Play</button> &nbsp;
          <button onClick={handleTrim}>Trim</button>
          <br />
          {trimedVideo && (
            <video controls>
              <source src={trimedVideo} type={video.type} />
            </video>
          )}
        </>
      )}
      <h3>Result</h3>

      {/* <button onClick={handleTrim}>Trim</button> */}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default TrimVideo;
