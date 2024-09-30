import express from "express";
import multer from "multer";
import { createWorker } from 'tesseract.js';
import usermodal from './Model/UserData.js';


const router = express.Router();




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Set the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name
    }
});

const upload = multer({ storage: storage });



router.get("/", async (req, res) => {
    res.json({ kid: "meee" });

});


router.post('/upload', upload.single('image'), async (req, res) => {


    let a = req.file;

    sample(a, async (cb) => {

        if (cb && cb) {



            const worker = await createWorker('eng');
            const ret = await worker.recognize(`https://airback.onrender.com/${cb}`);

            console.log("ret.data.text", ret.data.text);

            let converted_data = await convertStringToObject(ret.data.text);


            if (converted_data.Name && converted_data.JobTitle && converted_data.CompanyName && converted_data.Email && converted_data.PhoneNumber && converted_data.Address) {

                let obj = {
                    Name: converted_data?.Name || "-",
                    JobTitle: converted_data?.JobTitle || "-",
                    CompanyName: converted_data?.CompanyName || "-",
                    Email_Address: converted_data?.Email || "-",
                    PhoneNumber: converted_data?.PhoneNumber || "-",
                    image_path: cb,
                    Address: converted_data?.Address || "-"
                }

                await usermodal.find({
                    $and: [{
                        Name: converted_data.Name,
                        JobTitle: converted_data.JobTitle,
                        CompanyName: converted_data.CompanyName,
                        Email_Address: converted_data.Email,
                        PhoneNumber: converted_data.PhoneNumber,
                        image_path: cb,
                        Address: converted_data.Address
                    }]
                }).then(async (ddd) => {
                    if (ddd.length <= 0) {
                        await usermodal.create(obj).then((resd) => {
                            res.json({ status: 200, msg: "Details added successfully" });
                        });
                    } else {
                        res.json({ status: 400, msg: "Details of this visiting card is already exist" });
                    }
                });


            } else {
                res.json({ status: 400, msg: "Please upload valid visiting card" });
            }
        }
    });
});


async function sample(data, cb) {
    if (data && data.path) {
        console.log("data", data);
        cb(data.path);
    }
}


async function convertStringToObject(str) {
    const lines = str.split('\n').filter(line => line.trim() !== ''); // Split by newlines and remove empty lines
    const result = {};

    lines.forEach(line => {
        const [key, value] = line.split(':'); // Split by colon
        if (key && value) {
            result[key.trim()] = value.trim(); // Trim spaces and assign to object
        }
    });

    return result;
}


router.post('/cards', async (req, res) => {
    const perPage = 10;
    const page = Math.max(0, parseInt(req.body.page, 10) - 1 || 0);

    try {
        const resData = await usermodal.aggregate([
            {
                $facet: {
                    data: [
                        { $match: {} },
                        { $skip: perPage * page },
                        { $limit: perPage }
                    ],
                    count: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const data = resData[0].data;
        const totalCount = resData[0].count[0] ? resData[0].count[0].count : 0;

        res.json({
            status: 200,
            msg: "Details",
            data: data,
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / perPage),
            currentPage: page + 1
        });

    } catch (error) {
        res.status(500).json({ status: 500, msg: "Error fetching data", error: error.message });
    }
});



export default router;
