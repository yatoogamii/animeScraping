const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/anime_list", { useNewUrlParser: true, useUnifiedTopology: true });

// Model

const animeSchema = new mongoose.Schema({
  title: { type: String, unique: true, dropDups: true },
  synopsis: String,
  img: String,
  source: String,
  numberOfEpisode: String,
  studio: String,
  type: String,
  score: Number,
  genres: [String],
});

const Anime = mongoose.model("Anime", animeSchema);

// Function

exports.mongoConnection = async function mongoConnection() {
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", async () => {
    try {
      console.log("Mongo Connection has been established successfully");
    } catch (e) {
      console.log(e);
    }
  });
};

exports.mongoCreateAnime = async function mongoCreateAnime(animeInfos) {
  try {
    const newAnime = new Anime({
      title: animeInfos.title,
      synopsis: animeInfos.synopsis,
      studio: animeInfos.studio,
      numberOfEpisode: animeInfos.numberOfEpisode,
      source: animeInfos.source,
      score: animeInfos.score,
      genres: animeInfos.genres,
      img: animeInfos.img,
      type: animeInfos.type,
    });
    await newAnime.save();
    console.log(`Anime: ${newAnime.title} added successfully`);
  } catch (e) {
    console.error(e);
  }
};

exports.mongoClose = async function mongoClose() {
  try {
    const db = mongoose.connection;
    await db.close();
    console.log("Mongodb closed");
  } catch (e) {
    console.log(e);
  }
};
