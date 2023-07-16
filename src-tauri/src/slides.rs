use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Slide {
    Image(ImageSlide),
    Video(VideoSlide),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ImageSlide {
    pub r#type: String,
    pub src: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct VideoSlide {
    pub r#type: String,
    pub sources: Vec<VideoSource>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct VideoSource {
    pub src: String,
}
