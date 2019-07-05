/* Utilities */

class Observable {
  constructor() {
    this.value = undefined;
    this.callbacks = [];
  }
  onChange(callback) {
    this.callbacks.push(callback);
  }
  set(value) {
    this.value = value;
    this.callbacks.forEach(cb => cb(value));
  }
}

const API_KEY = "23315c01cb32eba5fcb03d0ad0a1ef43";
const BASE_URL = "https://api.themoviedb.org/3/";

const store = {
  films: new Observable(),
  recommendations: new Observable(),
  similar: new Observable(),
  more: new Observable(),
  indexParent: new Observable()
};

function searchFilm(film) {
  const searchParams = `${BASE_URL}search/movie?api_key=${API_KEY}&language=ru&query=`;
  fetch(`${searchParams}${film}`).then(async response => {
    if (response.status !== 200) {
      return;
    }
    const data = await response.json();
    store.films.set(data.results);
  });
}

const filmListNode = document.querySelector(".film-list");
const filmInput = document.querySelector(".film-input");
filmInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    searchFilm(filmInput.value);
  }
})
document.querySelector(".search-film").addEventListener("click", () => {
  searchFilm(filmInput.value);
});

[store.films, store.recommendations, store.similar].forEach(filmsObservable => {
  filmsObservable.onChange(films => {
    filmListNode.childNodes.forEach(child => child.remove());
    films.forEach((film, i) => {
      const filmNode = document.createElement("div");

      filmNode.classList.add("film-item");
      filmNode.setAttribute("data-index", i);

      const poster = document.createElement("img");
      poster.setAttribute(
        "src",
        `https://image.tmdb.org/t/p/w300/${film.poster_path}`,
      );
      filmNode.appendChild(poster);

      // const releaseDate = document.createElement("span");
      // releaseDate.innerText = film.release_date;
      // filmNode.appendChild(releaseDate);

      // const rating = document.createElement("span");
      // rating.innerText = film.vote_average;
      // filmNode.appendChild(rating);

      // const divOverview = document.createElement("div");
      // divOverview.innerText = film.overview;
      // filmNode.appendChild(divOverview);

      const similarBtn = document.createElement("button");
      similarBtn.setAttribute("data-similar", film.id);
      similarBtn.innerText = "похожие фильмы";
      filmNode.appendChild(similarBtn);

      const recommendedBtn = document.createElement("button");
      recommendedBtn.setAttribute("data-recomend", film.id);
      recommendedBtn.innerText = "рекомендации";
      filmNode.appendChild(recommendedBtn);

      const moreBtn = document.createElement("button");
      moreBtn.innerText = "подробнее";
      moreBtn.setAttribute("data-more", film.id);
      filmNode.appendChild(moreBtn);

      similarBtn.addEventListener("click", e => {
        fetch(
          `https://api.themoviedb.org/3/movie/${
            e.target.dataset.similar
          }/similar?api_key=${API_KEY}&language=ru`
        ).then(async response => {
          if (response.status !== 200) {
            return;
          }
          const data = await response.json();
          console.log(data);
          store.similar.set(data.results);
        });
      });

      moreBtn.addEventListener("click", e => {
        fetch(
          `https://api.themoviedb.org/3/movie/${
            e.target.dataset.more
          }?api_key=${API_KEY}&language=ru&append_to_response=credits`
        ).then(async response => {
          if (response.status !== 200) {
            return;
          }
          const indexParent = e.target.parentNode.dataset.index;
          store.indexParent.set(indexParent);
          const data = await response.json();
          store.more.set(data);
        });
      });

      recommendedBtn.addEventListener("click", e => {
        fetch(
          `https://api.themoviedb.org/3/movie/${
            e.target.dataset.recomend
          }/recommendations?api_key=${API_KEY}&language=ru`
        ).then(async response => {
          if (response.status !== 200) {
            return;
          }
          const data = await response.json();
          store.recommendations.set(data.results);
        });
      });

      filmListNode.appendChild(filmNode);
    });
  });
});
