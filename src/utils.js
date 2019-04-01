const generateFeedObject = (xmlDocument) => {
  const feedTitle = xmlDocument.querySelector('title').textContent;
  const feedDescr = xmlDocument.querySelector('description').textContent;
  const feedChildren = [...xmlDocument.querySelectorAll('item')]
    .map(item => [...item.children]
      .filter(child => child.nodeName === 'title' || child.nodeName === 'link'))
    .map(child => ({
      title: child[0].textContent,
      link: child[1].textContent,
    }));

  return { feedTitle, feedDescr, feedChildren };
};

export default generateFeedObject;
