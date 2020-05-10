const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/anime_list", { useNewUrlParser: true, useUnifiedTopology: true });

// Model

const animeSchema = new mongoose.Schema({
  title: { type: String, unique: true },
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

exports.mongoConnection = function mongoConnection() {
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", async () => {
    console.log("Connection has been established successfully");
    await db.dropCollection("animes");
  });
};

exports.mongoCreateAnime = async function mongoCreateAnime(animeInfos) {
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
  newAnime.save(async (err, newAnime) => {
    if (err) return console.error(err);
    console.log(`Anime: ${newAnime.title} added successfully`);
  });
};

exports.mongoClose = async function mongoClose() {
  const db = mongoose.connection;
  await db.close();
};
