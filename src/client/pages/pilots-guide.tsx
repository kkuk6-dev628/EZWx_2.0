function PilotsGuide() {
  return (
    <iframe
      id="ifamePdf"
      scrolling="auto"
      src={
        'https://docs.google.com/viewerng/viewer?url=' +
        'https://s3-static.ezwxbrief.com/PG/EZWxBrief-Pilots-Guide.pdf' +
        '&embedded=true'
      }
      height="100%"
      width="100%"
    ></iframe>
  );
}

export default PilotsGuide;
