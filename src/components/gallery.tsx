import { useAtom } from "jotai";
import { FC, memo } from "react";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { showGalleryAtom } from "../utils/atoms";

const Gallery: FC<{ slides: Slide[]; index: number }> = ({ slides, index }) => {
  const [show, setShow] = useAtom(showGalleryAtom);

  return (
    <Lightbox open={show} index={index} close={() => setShow(false)} plugins={[Video, Thumbnails]} slides={slides} />
  );
};

export default memo(Gallery);
