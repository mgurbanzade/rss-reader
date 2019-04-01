import 'bootstrap';
import './assets/index.scss';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import present from './presenter';

const state = {
  currState: [],
}
const submitBtn = document.querySelector('#submitBtn');
const inputField = document.querySelector('#inputField');
const CORS = 'https://cors-anywhere.herokuapp.com/';

const generateFeedObject = (xmlDoc) => {
  const feedTitle = xmlDoc.querySelector('title').textContent;
  const feedDescr = xmlDoc.querySelector('description').textContent;
  const feedChildren =
  [...xmlDoc.querySelectorAll('item')]
    .map(item => [...item.children]
    .filter(child => child.nodeName === 'title' || child.nodeName === 'link'))
    .map((child) => {
      return {
        title: child[0].textContent,
        link: child[1].textContent,
      }
    });

  return {
    feedTitle,
    feedDescr,
    feedChildren,
  }
}

submitBtn.addEventListener('click', (e) => {
  const link = inputField.value;
  const parser = new DOMParser();

  axios.get(CORS+link).then((response) => {
    const data = response.data;
    const xmlDoc = parser.parseFromString(data, 'application/xml');

    state.currState = [...state.currState, generateFeedObject(xmlDoc)]
  })
})

WatchJS.watch(state, 'currState', () => {
  console.log(state.currState)
  present(state.currState)
});
