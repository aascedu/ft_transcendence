// Translation functions.

function loadTranslations() {
	return fetch('/errorPages/translations.json')
	  .then(response => response.json())
	  .catch(error => console.error(error));
}

function switchLanguageAttr(locale, newAttr) {
	loadTranslations().then(translations => {
	  document.querySelectorAll('[data-language]').forEach(element => {
		const key = element.getAttribute('data-language');
		if (element.hasAttribute(newAttr)) {
			element.setAttribute(newAttr, translations[locale][key]);
		}
	  });
	});
}

function switchLanguageContent(locale) {
	loadTranslations().then(translations => {
	  document.querySelectorAll('[data-language]').forEach(element => {
		const key = element.getAttribute('data-language');
		if (element.textContent.trim() !== '') {
			var	info;
			if (element.querySelector('b') !== null) {
				info = element.querySelector('b').innerHTML;
				info = info.replace(/\&nbsp;/g, '');
			}
			element.textContent = translations[locale][key];
			if (info && info.trim() !== '') {
				addInfoToElement(info, element);
			}
		}
	  });
	});
}

// Language selector : updates the page language / updates the selector images.

document.querySelectorAll('.language-selector-dropdown').forEach(function(item) {
	item.addEventListener('click', function(event) {
		event.preventDefault();

		var	activeImg = this.parentNode;
		while (!activeImg.classList.contains('language-selector'))
			activeImg = activeImg.parentNode;
		activeImg = activeImg.firstElementChild.firstElementChild;
		var	activeImgSrc = activeImg.src;
		var	activeLang = activeImg.alt;
		var	selectedImg = this.firstElementChild;
		var	selectedLang = selectedImg.getAttribute('alt');

		switchLanguageAttr(selectedLang, 'placeholder');
		switchLanguageContent(selectedLang);
		activeImg.setAttribute('src', selectedImg.getAttribute('src'));
		activeImg.setAttribute('alt', selectedLang);
		selectedImg.setAttribute('src', activeImgSrc);
		selectedImg.setAttribute('alt', activeLang);
	});
});