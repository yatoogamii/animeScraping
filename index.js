const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://myanimelist.net/anime.php");

    const allGenre = await page.$eval(".genre-link", async element => {
      const arr = [];
      for (const genre of element.querySelectorAll("a.genre-name-link")) {
        const genreInnerHTML = genre.innerHTML.split("(")[0];

        const formatedGenre = genreInnerHTML
          .trim()
          .split(" ")
          .map(value => value[0].toUpperCase() + value.slice(1))
          .join("");

        arr.push({ name: formatedGenre, url: genre.href });
      }
      return arr;
    });

    for (const genre of allGenre) {
      await page.goto(genre.url);

      const allAnime = await page.$$eval(".seasonal-anime", async elements => {
        const arr = [];
        for (const element of elements) {
          const title = element.querySelector(".link-title").innerHTML;
          arr.push({ title });
        }
        return arr;
      });

      await fs.writeFileSync(`./database/${genre.name}.json`, JSON.stringify(allAnime));
    }

    console.log(allGenre);

    await browser.close();
  } catch (e) {
    console.log(e);
  }
})();
