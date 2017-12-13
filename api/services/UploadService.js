module.exports = {
  upload: (req, config) => {
    return new Promise((resolve, reject) => {
      req.file(config.name).upload(
        {
            dirname: config.dirname,
            saveAs: (__newFileStream, cb) => { 
                cb(null, __newFileStream.filename);
           	}
        }, 
        (error, files) =>  error ? reject(error) : resolve(files)
      );
    });
  }
};
