import {jsonFolderPath} from './../constants.js';
export default class HttpClient {
    constructor(params) {
        this.params = params || '';
    }
    
    createUrl(file) {
        return `${jsonFolderPath}${file}.json${this.params}`;
    }
    
    get(url) {
        return fetch(this.createUrl(url)).then(data => data.json());
    } 
}