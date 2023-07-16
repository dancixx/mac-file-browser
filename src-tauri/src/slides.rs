use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Slides {
    pub images: Vec<ImageSlide>,
    pub videos: Vec<VideoSlide>,
}

impl Slides {
    pub fn new() -> Self {
        Self {
            images: Vec::new(),
            videos: Vec::new(),
        }
    }
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
