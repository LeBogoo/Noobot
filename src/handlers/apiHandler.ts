import { Client } from "discord.js";
import express from "express";
import mongoose from "mongoose";
import { Feedback, feedbackSchema } from "../commands/feedback";

const priorityLookup = {
    3: "danger",
    2: "warning",
    1: "success",
};

export default async function (client: Client) {
    const app = express();
    const feedbackModel = mongoose.model("Feedback", feedbackSchema);

    app.set("view engine", "ejs");
    app.use(express.static("public"));

    app.get("/", async (req, res) => {
        const mongooseResults: Feedback[] = (await feedbackModel.find({ pending: true })) as Feedback[];

        let feedbacks: {
            title: string;
            description: string;
            style: string;
            priority: number;
            author: string;
            date: string;
            id: string;
        }[] = [];
        mongooseResults.forEach((feedback) => {
            feedbacks.push({
                title: feedback.title,
                description: feedback.description,
                style: priorityLookup[feedback.priority],
                priority: feedback.priority,
                author: `${feedback.author.name}#${feedback.author.hash} (${feedback.author.id})`,
                date: feedback.date,
                id: feedback._id,
            });
        });

        feedbacks = feedbacks.sort((a, b) => b.priority - a.priority);

        res.render("index", {
            botname: client.user!.username,
            feedbacks,
        });
    });

    app.get("/feedback/close/:id", async (req, res) => {
        const id = mongoose.Types.ObjectId(req.params.id);

        const mongooseResult: Feedback | null = (await feedbackModel.findOne({ _id: id })) as Feedback | null;
        if (!mongooseResult) return res.status(404).send("id not found.");

        mongooseResult.pending = false;
        mongooseResult.save();
        res.json(mongooseResult);
    });

    app.listen(8080, () => {
        console.log("Api is ready!");
    });
}
