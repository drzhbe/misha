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

function requestFilm(url, params, callback) {
  fetch(`${BASE_URL}${url}?${SEARCH_PARAMS}&${params}`).then(async response => {
    if (response.status !== 200) {
      return;
    }
    const data = await response.json();
    callback(data);
  });
}

const API_KEY = "23315c01cb32eba5fcb03d0ad0a1ef43";
const BASE_URL = "https://api.themoviedb.org/3";
const SEARCH_PARAMS = `api_key=${API_KEY}&language=ru`;

const store = {
  films: new Observable(),
  recommendations: new Observable(),
  similar: new Observable(),
  more: new Observable(),
};

function searchFilm(film) {
  fetch(`${BASE_URL}/search/movie?query=${film}&${SEARCH_PARAMS}`).then(async response => {
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

      const similarBtn = document.createElement("button");
      similarBtn.innerText = "похожие фильмы";
      filmNode.appendChild(similarBtn);

      const recommendedBtn = document.createElement("button");
      recommendedBtn.innerText = "рекомендации";
      filmNode.appendChild(recommendedBtn);

      const moreBtn = document.createElement("button");
      moreBtn.innerText = "подробнее";
      filmNode.appendChild(moreBtn);

      similarBtn.addEventListener("click", e => {
        requestFilm(`/movie/${film.id}/similar`, undefined, data => store.similar.set(data.results));
      });

      moreBtn.addEventListener("click", e => {
        requestFilm(`/movie/${film.id}`, `append_to_response=credits`, data => store.more.set(data));
      });

      recommendedBtn.addEventListener("click", e => {
        requestFilm(`/movie/${film.id}/recommendations`, undefined, data => store.recommendations.set(data.results));
      });

      filmListNode.appendChild(filmNode);
    });
  });
});
