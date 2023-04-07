import { useEffect, useRef, useState } from "react";
import "./../App.css";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const ffmpeg = createFFmpeg({ log: true });

function AddText() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [endTime, setEndTime] = useState(0);
  const [text, setText] = useState("");
  const [textVideo, setTextVideo] = useState();

  const videoRef = useRef();
  let initialSliderValue = 0;

  const load = async () => {
    await ffmpeg.load();
    ffmpeg.setLogging(true);
    setReady(true);
  };

  useEffect(() => {
    load();
    return () => {
      ffmpeg.exit();
    };
  }, []);

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

  const handleText = async () => {
    const { name, type } = video;
    console.log("nmaaa", name);
    const videoFileType = type.split("/")[1];
    console.log("hannlde text", videoFileType);
    ffmpeg.FS("writeFile", name, await fetchFile(video));
    ffmpeg.FS(
      "writeFile",
      "Roboto-Regular.ttf",
      await fetchFile(
        "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.1/fonts/roboto/Roboto-Regular.ttf"
      )
    );

    const fileName = `out.${videoFileType}`;
    try {
      await ffmpeg.run(
        "-i",
        name,
        "-vf",
        "drawtext=fontfile='Roboto-Regular.ttf:fontcolor=white:fontsize=50:text='test':x=(w-tw)/2:y=200",
        "-preset",
        "ultrafast",
        "-y",
        // "drawtext=text='My text starting at 640x360':x=640:y=360:fontsize=24:fontcolor=white",
        // "-c:a",
        // "copy",
        fileName
      );
    } catch (e) {
      console.log(e);
    }

    const data = ffmpeg.FS("readFile", fileName);
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: video.type })
    );
    console.log(url);
    setTextVideo(url);
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
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <br />
          <button onClick={handlePlay}>Play</button> &nbsp;
          <button onClick={handleText}>Add Text</button>
          <br />
          {textVideo && <video controls src={textVideo} />}
        </>
      )}
      <h3>Result</h3>

      {/* <button onClick={handleTrim}>Trim</button> */}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default AddText;
