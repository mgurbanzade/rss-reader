const generateFeedObject = (xmlDocument) => {
  const feedTitle = xmlDocument.querySelector('title').textContent;
  const feedDescr = xmlDocument.querySelector('description').textContent;
  const childAttributes = ['title', 'link', 'description'];
  const feedChildren = [...xmlDocument.querySelectorAll('item')]
    .map(item => [...item.children]
      .filter(child => childAttributes.includes(child.nodeName)))
    .map(child => ({
      title: child.filter(c => c.nodeName === 'title')[0].textContent,
      link: child.filter(c => c.nodeName === 'link')[0].textContent,
      description: child.filter(c => c.nodeName === 'description')[0].textContent,
    }));

  return { feedTitle, feedDescr, feedChildren };
};

export default generateFeedObject;
