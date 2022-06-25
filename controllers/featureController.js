const {body, validationResult} = require('express-validator/check');
const sharp = require('sharp');
const download = require('image-downloader');
const jsonpatch = require('fast-json-patch');
const { fileExtension } = require('../middleware/customMiddleware');

const imageTypes = ['jpg', 'tif', 'gif', 'png', 'svg']

// Resize image on post
exports.create_thumbnail_post = (req, res, next) => {
    // Save imageUrl and extension
    const { imageUrl } = req.body;
    // Save image extension. Convert to lowercase 
    const imageUrlExt = fileExtension(imageUrl).toLowerCase();

    // If imageUrl is a image file type then proceed to resize
    if (imageTypes.includes(imageUrlExt)) {
        const options = {
            url: imageUrl,
            dest: './public/images/original/',
        }
        // Set Location for resized images to be saved
        const resizeFolder = './public/images/resized/'

        // Download image from url and save in selected destination in options.
        download.image(options).then(({filename}) => {
            // Resize image to 50x50 and save to desired location
            // Return conversion status to user
            sharp(filename)
                .resize(50, 50)
                .toFile(`${resizeFolder}output.${imageUrlExt}`, (err) => {
                    if (err) { return next(err) }
                    return res.json({
                        converted: true, user: req.user.username, success: 'Image has been resized',
                        thumbnail: resizeFolder,
                    })
                })
        })
        .catch(() => {
            res.status(400).json({error: 'Oops something went wrong. Kindly check your image url and try again'})
        })
    } else {
        res.status(400).json({ error: `We only handle image files with extension - ${[...imageTypes]}`});
    }
}

// Apply JSON patch to json object and return patched object
exports.patch_json_patch = [
    // Validate input fields. Trim spaces around username
    body('jsonObject', 'JSON object must not be empty').isLength({min: 1}),
    body('jsonPatchObject', 'JSON patch object must not be empty').isLength({min: 1}),

    // Process the request after validating 
    (req, res, next) => {
        // Save error after validating req
        const errors = validationResult(req);

        // Check if there were errors from the form
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        // Save object-to-patch and patch-object from the request
        const jsonObject = JSON.parse(req.body.jsonObject);
        const jsonPatchObject = JSON.parse(req.body.jsonPatchObject);

        // Save patch in new variable
        const patchedObject = jsonpatch.applyPatch(jsonObject, jsonPatchObject).newDocument;
        // res.json({user: req.user.username, patchedObject: patchedObject})
        req.json({ patchedObject })
    },
]
