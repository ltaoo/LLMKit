
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    // #[error("there is something wrong in io")]
    // IOError(std::io::Error),
    #[error("there is something wrong in reqwest")]
    // ReqwestError(reqwest::Error),
    // #[error("there is something wrong in serde_json")]
    SerdeJSONError(serde_json::Error),
    #[error("there is something wrong when encode utf8")]
    FromUtf8Error(std::string::FromUtf8Error),
    #[error("database error: {0}")]
    SqlxError(#[from] sqlx::Error),
    #[error("unknown error")]
    OtherError(String),
}
impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        Error::SerdeJSONError(err)
    }
}
impl From<std::string::FromUtf8Error> for Error {
    fn from(err: std::string::FromUtf8Error) -> Self {
        Error::FromUtf8Error(err)
    }
}
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}