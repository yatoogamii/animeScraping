const puppeteer = require("puppeteer");
const scrollPageToBottom = require("puppeteer-autoscroll-down");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://myanimelist.net/anime.php", { waitUntil: "load" });

    // get all genre
    const allGenre = await getAllGenre(page);

    // get all anime
    await getAllAnime(page, allGenre);

    console.log(allGenre);

    await browser.close();
  } catch (e) {
    console.log(e);
  }
})();

async function getAllGenre(page) {
  const allGenre = await page.$eval(".genre-link", async element => {
    const arr = [];
    for (const genre of element.querySelectorAll("a.genre-name-link")) {
      const genreInnerHTML = genre.innerHTML.split("(")[0];
      const numberOfAnime = +genre.innerHTML
        .split("(")[1]
        .split(",")
        .join("")
        .slice(0, -1);
      console.log(genreInnerHTML);
      const formatedGenre = genreInnerHTML
        .trim()
        .split(" ")
        .map(value => value[0].toUpperCase() + value.slice(1))
        .join("");

      arr.push({ name: formatedGenre, numberOfAnime, url: genre.href });
    }
    return arr;
  });

  return allGenre;
}

async function getAllAnime(page, allGenre) {
  // for (const genre of allGenre) {
  let numberOfPages = Math.ceil(allGenre[allGenre.length - 1].numberOfAnime / 100);
  const allAnime = [];

  while (numberOfPages > 0) {
    await page.goto(`${allGenre[allGenre.length - 1].url}?page=${numberOfPages}`, { waitUntil: "load" });

    await page.setViewport({
      width: 1200,
      height: 800,
    });

    // Scroll to the very top of the page
    await page.evaluate(_ => {
      window.scrollTo(0, 0);
    });

    // Scroll to the bottom of the page with puppeteer-autoscroll-down
    await scrollPageToBottom(page);

    const allAnimeOfPage = await page.$$eval(".seasonal-anime", async elements => {
      const arr = [];
      for (const element of elements) {
        const title = element.querySelector(".link-title").innerHTML;
        const synopsis = element.querySelector(".synopsis .preline").innerHTML;
        const img = element.querySelector("img").getAttribute("src");
        const source = element.querySelector("span.source").innerHTML;
        const numberOfEpisode = element.querySelector("div.eps span").innerHTML.split(" ")[0];
        const studio = element.querySelector("span.producer a")?.innerHTML ?? null;
        const type = element.querySelector("div.info").innerText;
        arr.push({ title, synopsis, img, source, numberOfEpisode, studio, type });
      }
      return arr;
    });
    allAnime.push(...allAnimeOfPage);
    numberOfPages--;
  }

  await fs.writeFileSync(`./database/${allGenre[allGenre.length - 1].name}.json`, JSON.stringify(allAnime));
  // }
}
