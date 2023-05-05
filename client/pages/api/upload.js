import multer from "multer";
import { Web3Storage, File } from "web3.storage";
import * as FileType from "file-type";

const memoryStorage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
	const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only image files are allowed."), false);
	}
};

const limits = {
	fileSize: 3 * 1024 * 1024, // 3 MB
};

const upload = multer({ storage: memoryStorage, fileFilter, limits });

const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_API_KEY;

const storage = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

export const config = {
	api: {
		bodyParser: false,
	},
};

async function uploadToWeb3Storage(file) {
	const { originalname, buffer } = file;
	const fileType = (await FileType.fileTypeFromBuffer(buffer)) || { mime: "application/octet-stream" };
	const fileContent = new File([new Uint8Array(buffer)], originalname, { type: fileType.mime });

	const cid = await storage.put([fileContent]);
	return cid;
}

export default async function handler(req, res) {
	if (req.method === "POST") {
		const handleUpload = upload.single("media");

		handleUpload(req, res, async (err) => {
			if (err) {
				console.log("Got an error 1 - ", err);
				res.status(500).json({ error: err.message });
			} else {
				try {
					const cid = await uploadToWeb3Storage(req.file);
					console.log("Got back CID = ", cid);
					res.status(200).json({ cid: cid.toString() });
				} catch (error) {
					console.log("Got an error = ", error);
					res.status(500).json({ error: error.message });
				}
			}
		});
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
