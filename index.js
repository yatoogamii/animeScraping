const puppeteer = require("puppeteer");
const scrollPageToBottom = require("puppeteer-autoscroll-down");
const pLimit = require("p-limit");

const getAllUrlOfGenres = async browser => {
  try {
    const page = await browser.newPage();
    await page.goto("https://myanimelist.net/anime.php", { waitUntil: "load" });

    const result = await page.evaluate(() => {
      return [...document.querySelector(".genre-link").querySelectorAll("a.genre-name-link")].map(genre => {
        const genreInnerHTML = genre.innerHTML.split("(")[0];
        const numberOfPages = Math.ceil(
          +genre.innerHTML
            .split("(")[1]
            .split(",")
            .join("")
            .slice(0, -1) / 100,
        );
        const formatedGenre = genreInnerHTML
          .trim()
          .split(" ")
          .map(value => value[0].toUpperCase() + value.slice(1))
          .join("");

        const urls = [];
        for (let i = 1; i <= numberOfPages; i++) {
          urls.push(`${genre.href}?page=${i}`);
        }

        return urls;
      });
    });
    return result.flat();
  } catch (e) {
    console.log(e);
  }
};

const getAnimesFromUrl = async (browser, url) => {
  // loop into url
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load" });
    await scrollPageToBottom(page);

    const allInfosOfAnimes = await page.evaluate(() => {
      const allAnimes = [...document.querySelectorAll(".seasonal-anime")];
      const allInfosOfAnimes = allAnimes.map(anime => {
        return {
          title: anime.querySelector(".link-title").innerHTML,
          synopsis: anime.querySelector(".synopsis .preline").innerHTML,
          img: anime.querySelector("img").getAttribute("src"),
          source: anime.querySelector("span.source").innerHTML,
          numberOfEpisode: anime.querySelector("div.eps span").innerHTML.split(" ")[0],
          studio: anime.querySelector("span.producer a")?.innerHTML ?? null,
          type: anime
            .querySelector("div.info")
            .innerText.split("-")[0]
            .trim(),
          score: +anime.querySelector(".score").innerText.trim(),
          genres: [...anime.querySelectorAll(".genre a")].map(value => {
            return value.innerText;
          }),
        };
      });
      return allInfosOfAnimes;
    });
    await page.close();
    return allInfosOfAnimes;
  } catch (e) {
    console.log(e);
  }
};

const scrap = async () => {
  try {
    const limit = pLimit(10);
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1200, height: 800 } });
    const genresUrlList = await getAllUrlOfGenres(browser);
    const allInfosOfAllAnimes = await Promise.all(genresUrlList.map(url => limit(() => getAnimesFromUrl(browser, url))));

    browser.close();
    return allInfosOfAllAnimes;
  } catch (e) {
    console.log(e);
  }
};

scrap()
  .then(value => {
    console.log(value);
    process.exit(1);
  })
  .catch(err => {
    console.log(err);
  });
