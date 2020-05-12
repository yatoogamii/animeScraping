const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("anime_list", "elias", "password", {
  host: "localhost",
  dialect: "postgres",
});

// Model
class Anime extends Model {}
Anime.init(
  {
    title: {
      type: Sequelize.STRING,
      unique: true,
    },
    synopsis: {
      type: Sequelize.TEXT,
    },
    img: {
      type: Sequelize.STRING,
    },
    source: {
      type: Sequelize.STRING,
    },
    numberOfEpisode: {
      type: Sequelize.STRING,
    },
    studio: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
    score: {
      type: Sequelize.FLOAT,
    },
    genres: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
  },
  {
    sequelize,
    modelName: "anime",
  },
);

// function
exports.sqlConnection = async function sqlConnection() {
  try {
    const connection = await sequelize.authenticate();
    await Anime.sync({ force: true });
    console.log("SQL Connection has been established successfully");
  } catch (e) {
    console.error("Unable to connect to the database:", e);
  }
};

exports.sqlCreateAnime = async function sqlCreateAnime(animeInfos) {
  try {
    const response = await Anime.create({
      title: animeInfos.title,
      synopsis: animeInfos.synopsis,
      score: animeInfos.score,
      img: animeInfos.img,
      source: animeInfos.source,
      studio: animeInfos.studio,
      genres: animeInfos.genres,
      type: animeInfos.type,
      numberOfEpisode: animeInfos.numberOfEpisode,
    });
    console.log(response);
  } catch (e) {
    console.log(e);
  }
};

exports.sqlClose = async function sqlClose() {
  try {
    const connection = await sequelize.close();
    console.log("SQL db closed");
  } catch (e) {
    console.log(e);
  }
};
