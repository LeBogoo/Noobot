import { Client } from "discord.js";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { logger } from "..";
import { Feedback, feedbackSchema } from "../commands/feedback";
import { loadConfig } from "../Config";
dotenv.config();

const priorityLookup: { [key: number]: string } = {
    3: "danger",
    2: "warning",
    1: "success",
};

export default async function (client: Client) {
    const app = express();
    const feedbackModel = mongoose.model("Feedback", feedbackSchema);

    app.set("view engine", "ejs");
    app.use(express.static("public"));

    app.get("/", async (req: Request, res: Response) => {
        res.render("index", {
            botname: client.user!.username,
        });
    });

    app.get("/feedback", async (req: Request, res: Response) => {
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

        res.render("feedback", {
            botname: client.user!.username,
            feedbacks,
        });
    });

    app.get("/config", async (req: Request, res: Response) => {
        const configs = client.guilds.cache.map((guild) => {
            return { id: guild.id, name: guild.name };
        });

        res.render("configs", {
            botname: client.user!.username,
            configs,
        });
    });

    app.get("/config/:id", async (req: Request, res: Response) => {
        const guildConfig = await loadConfig(req.params.id);

        const config = {
            name: client.guilds.cache.find((guild) => guild.id == req.params.id)?.name,
            ...guildConfig.toObject(),
            levelImage: guildConfig.levelsystem.levelImage?.toString("base64"),
            ranklistImage: guildConfig.levelsystem.ranklistImage?.toString("base64"),
        };
        res.render("config", {
            botname: client.user!.username,
            config,
        });
    });

    app.get("/feedback/close/:id", async (req: Request, res: Response) => {
        const id = mongoose.Types.ObjectId(req.params.id);

        const mongooseResult: Feedback | null = (await feedbackModel.findOne({ _id: id })) as Feedback | null;
        if (!mongooseResult) return res.status(404).send("id not found.");

        mongooseResult.pending = false;
        mongooseResult.save();
        res.json(mongooseResult);
    });

    app.listen(parseInt(process.env.WEBSERVER_PORT || "8001"), () => {
        logger.log("Api is ready!");
    });
}
