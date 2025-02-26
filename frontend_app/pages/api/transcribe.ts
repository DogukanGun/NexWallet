import { NextApiRequest, NextApiResponse } from "next";
import multiparty from "multiparty";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import ffmpeg from 'fluent-ffmpeg';
import { withAuth } from "@/middleware/withAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;
    if (method === "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const openai = new OpenAI({
        apiKey: process.env.OPEN_AI_KEY || "",
    });

    const tmpDir = path.join(process.cwd(), "tmp");

    // Ensure the temporary directory exists
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    const form = new multiparty.Form({ uploadDir: tmpDir });

    form.parse(req, async (err: Error | null, fields: Record<string, string[] | undefined>, files: Record<string, multiparty.File[] | undefined>) => {
        if (err) {
            console.error("Error parsing form data:", err, req.headers["content-type"]);
            res.status(500).json({ error: "Failed to parse form data" });
            return;
        }

        if (!files.audio || !files.audio[0]) {
            res.status(400).json({ error: "No audio file uploaded" });
            return;
        }

        const audioFile = files.audio[0];
        const filePath = audioFile.path;
        const outputPath = path.join(tmpDir, 'converted.wav');
        console.log("Transcribing audio file:", filePath);
        if (!fs.existsSync(filePath)) {
            console.error("File does not exist:", filePath);
            res.status(400).json({ error: "Uploaded file is missing or inaccessible" });
            return;
        }
        
        ffmpeg(filePath)
        .toFormat('wav')
        .on('end', async () => {
            try {
            const transcription = await openai.audio.translations.create({
                file: fs.createReadStream(outputPath),
                model: "whisper-1",
            });

            res.status(200).json({ text: transcription.text });
            } catch (error) {
            console.error("Error during transcription:", error);
            res.status(500).json({ error: "Failed to transcribe audio file" });
            } finally {
            // Clean up the temporary files
            fs.unlinkSync(filePath);
            fs.unlinkSync(outputPath);
            }
        })
        .on('error', (error) => {
            console.error("Error during file conversion:", error);
            res.status(500).json({ error: "Failed to convert audio file" });
            // Clean up the temporary file
            fs.unlinkSync(filePath);
        })
        .save(outputPath); // Specify the output file path
    });
};

export const config = {
    api: {
        bodyParser: false, // Required for `multiparty` to handle the form data
    },
};

export default withAuth(handler); 
