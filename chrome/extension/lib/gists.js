import { loadStylefileFromString } from "./stylefile";

export const STYLEFILE_NAMES = ["Stylefile.yml", "Stylefile"];
export const SPECIAL_QUERY_PARAMS = {
  gist_id: "styleURLGistID"
};

export const getGistById = id =>
  window
    .fetch(`https://api.github.com/gists/${id}`, {
      redirect: "follow",
      credentials: "include"
    })
    .then(resp => {
      return resp.json();
    });

export const getGistIDFromURL = url => {
  const queryString = _.last(url.split("?"));

  if (!queryString) {
    return null;
  }

  const params = new URLSearchParams(queryString);

  return params.get(SPECIAL_QUERY_PARAMS.gist_id);
};

export const getStylesheetsFromGist = gist => {
  return _
    .keys(gist.files || [])
    .filter(fileName => {
      const file = gist.files[fileName];

      return file.type === "text/css";
    })
    .map(filename => [filename, gist.files[filename].content]);
};

export const loadStylefileFromGist = gist => {
  const filename = _.keys(gist.files || []).find(fileName => {
    return STYLEFILE_NAMES.includes(fileName);
  });

  if (!filename) {
    return null;
  }

  return loadStylefileFromString(gist.files[filename].content);
};

export const applyStyleURLToTabID = async (gist, tabId) => {
  const stylesheets = getStylesheetsFromGist(gist);
  stylesheets.forEach(stylesheet => {
    const content = stylesheet[1];
    console.log("Inserting Stylesheet", stylesheet, "into tab", tabId);
    chrome.tabs.insertCSS(tabId, {
      cssOrigin: "author",
      code: content,
      runAt: "document_start"
    });
  });
};
