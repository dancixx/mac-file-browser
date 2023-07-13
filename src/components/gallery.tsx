import { useAtom } from "jotai";
import { FC, memo } from "react";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { showGalleryAtom } from "../utils/atoms";

const Gallery: FC<{ slides: Slide[] }> = ({ slides }) => {
  const [show, setShow] = useAtom(showGalleryAtom);

  return <Lightbox open={show} close={() => setShow(false)} plugins={[Video]} slides={slides} />;
};

export default memo(Gallery);
