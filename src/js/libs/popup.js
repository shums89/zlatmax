// Модуль попапов
// (c) Фрилансер по жизни, Хмурый Кот
// Документация по работе в шаблоне:
// data-popup - Атрибут для кнопки, которая вызывает попап
// data-close - Атрибут для кнопки, которая закрывает попап
// data-youtube - Атрибут для кода youtube
// Сниппет (HTML): pl

// Подключение функционала "Чертогов Фрилансера"
import { isMobile, bodyLockStatus, bodyLockToggle, FLS } from "../files/functions.js";
import { flsModules } from "../files/modules.js";

// Класс Popup
class Popup {
	constructor(options) {
		let config = {
			logging: true,
			init: true,
			// Для кнопок 
			attributeOpenButton: 'data-popup', // Атрибут для кнопки, которая вызывает попап
			attributeCloseButton: 'data-close', // Атрибут для кнопки, которая закрывает попап
			// Для сторонних объектов
			fixElementSelector: '[data-lp]', // Атрибут для элементов с левым паддингом (которые fixed)
			// Для объекта попапа
			youtubeAttribute: 'data-youtube', // Атрибут для кода youtube
			youtubePlaceAttribute: 'data-youtube-place', // Атрибут для вставки ролика youtube
			setAutoplayYoutube: true,
			// Изменение классов
			classes: {
				popup: 'popup',
				// popupWrapper: 'popup__wrapper',
				popupContent: 'popup__content',
				popupActive: 'popup_show', // Добавляется для попапа, когда он открывается
				bodyActive: 'popup-show', // Добавляется для боди, когда попап открыт
			},
			focusCatch: true, // Фокус внутри попапа зациклен
			closeEsc: true, // Закрытие по ESC
			bodyLock: true, // Блокировка скролла
			bodyLockDelay: 500, // Задержка блокировки скролла

			hashSettings: {
				location: true, // Хэш в адресной строке
				goHash: true, // Переход по наличию в адресной строке
			},
			on: { // События
				beforeOpen: function () { },
				afterOpen: function () { },
				beforeClose: function () { },
				afterClose: function () { },
			},
		}
		this.isOpen = false;
		// Текущее окно
		this.targetOpen = {
			selector: false,
			element: false,
		}
		// Предыдущее открытое
		this.previousOpen = {
			selector: false,
			element: false,
		}
		// Последнее закрытое
		this.lastClosed = {
			selector: false,
			element: false,
		}
		this._dataValue = false;
		this.hash = false;

		this._reopen = false;
		this._selectorOpen = false;

		this.lastFocusEl = false;
		this._focusEl = [
			'a[href]',
			'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
			'button:not([disabled]):not([aria-hidden])',
			'select:not([disabled]):not([aria-hidden])',
			'textarea:not([disabled]):not([aria-hidden])',
			'area[href]',
			'iframe',
			'object',
			'embed',
			'[contenteditable]',
			'[tabindex]:not([tabindex^="-"])'
		];
		//this.options = Object.assign(config, options);
		this.options = {
			...config,
			...options,
			classes: {
				...config.classes,
				...options?.classes,
			},
			hashSettings: {
				...config.hashSettings,
				...options?.hashSettings,
			},
			on: {
				...config.on,
				...options?.on,
			}
		}
		this.options.init ? this.initPopups() : null
	}
	initPopups() {
		this.popupLogging(`Проснулся`);
		this.eventsPopup();
	}
	eventsPopup() {
		// Клик на всем документе
		document.addEventListener("click", function (e) {
			// Клик по кнопке "открыть"
			const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
			if (buttonOpen) {
				e.preventDefault();
				this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ?
					buttonOpen.getAttribute(this.options.attributeOpenButton) :
					'error';
				if (this._dataValue !== 'error') {
					if (!this.isOpen) this.lastFocusEl = buttonOpen;
					this.targetOpen.selector = `${this._dataValue}`;
					this._selectorOpen = true;
					this.open();
					return;

				} else this.popupLogging(`Ой ой, не заполнен атрибут у ${buttonOpen.classList}`);

				return;
			}
			// Закрытие на пустом месте (popup__wrapper) и кнопки закрытия (popup__close) для закрытия
			const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
			if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
		}.bind(this));
		// Закрытие по ESC
		document.addEventListener("keydown", function (e) {
			if (this.options.closeEsc && e.which == 27 && e.code === 'Escape' && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
			if (this.options.focusCatch && e.which == 9 && this.isOpen) {
				this._focusCatch(e);
				return;
			}
		}.bind(this))

		// Открытие по хешу
		if (this.options.hashSettings.goHash) {
			// Проверка изменения адресной строки
			window.addEventListener('hashchange', function () {
				if (window.location.hash) {
					this._openToHash();
				} else {
					this.close(this.targetOpen.selector);
				}

			}.bind(this))

			window.addEventListener('load', function () {
				if (window.location.hash) {
					this._openToHash();
				}

			}.bind(this))
		}
	}
	open(selectorValue) {
		// Если ввести значение селектора (селектор настраивается в options)
		if (selectorValue && typeof (selectorValue) === "string" && selectorValue.trim() !== "") {
			this.targetOpen.selector = selectorValue;
			this._selectorOpen = true;
		}
		if (this.isOpen) {
			this._reopen = true;
			this.close();
		}
		if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
		if (!this._reopen) this.previousActiveElement = document.activeElement;

		this.targetOpen.element = document.querySelector(this.targetOpen.selector);

		if (this.targetOpen.element) {
			// YouTube
			if (this.targetOpen.element.hasAttribute(this.options.youtubeAttribute)) {
				const codeVideo = this.targetOpen.element.getAttribute(this.options.youtubeAttribute);

				const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`

				const iframe = document.createElement('iframe');
				iframe.setAttribute('allowfullscreen', '');

				const autoplay = this.options.setAutoplayYoutube ? 'autoplay;' : '';
				iframe.setAttribute('allow', `${autoplay}; encrypted-media`);

				iframe.setAttribute('src', urlVideo);

				if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`))
					this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
			}
			if (this.options.hashSettings.location) {
				// Получение хэша и его выставление 
				this._getHash();
				this._setHash();
			}

			// До открытия
			this.options.on.beforeOpen(this);

			this.targetOpen.element.classList.add(this.options.classes.popupActive);
			document.body.classList.add(this.options.classes.bodyActive);

			if (!this._reopen) bodyLockToggle();
			else this._reopen = false;

			this.targetOpen.element.setAttribute('aria-hidden', 'false');

			// // Запоминаю это открытое окно. Оно будет последним открытым
			this.previousOpen.selector = this.targetOpen.selector;
			this.previousOpen.element = this.targetOpen.element;

			this._selectorOpen = false;

			this.isOpen = true;

			setTimeout(() => {
				this._focusTrap();
			}, 50);

			// После открытия
			//this.options.on.afterOpen(this);

			// Создаем свое событие после открытия попапа
			document.dispatchEvent(new CustomEvent("afterPopupOpen", {
				detail: {
					popup: this
				}
			}));
			this.popupLogging(`Открыл попап`);

		} else this.popupLogging(`Ой ой, такого попапа нет. Проверьте корректность ввода. `);
	}
	close(selectorValue) {
		if (selectorValue && typeof (selectorValue) === "string" && selectorValue.trim() !== "") {
			this.previousOpen.selector = selectorValue;
		}
		if (!this.isOpen || !bodyLockStatus) {
			return;
		}
		// До закрытия
		this.options.on.beforeClose(this);
		// YouTube
		if (this.targetOpen.element.hasAttribute(this.options.youtubeAttribute)) {
			if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`))
				this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = '';
		}
		this.previousOpen.element.classList.remove(this.options.classes.popupActive);
		// aria-hidden
		this.previousOpen.element.setAttribute('aria-hidden', 'true');
		if (!this._reopen) {
			document.body.classList.remove(this.options.classes.bodyActive);
			bodyLockToggle();
			this.isOpen = false;
		}
		// Очищение адресной строки
		this._removeHash();
		if (this._selectorOpen) {
			this.lastClosed.selector = this.previousOpen.selector;
			this.lastClosed.element = this.previousOpen.element;

		}
		// После закрытия
		this.options.on.afterClose(this);
		setTimeout(() => {
			this._focusTrap();
		}, 50);

		this.popupLogging(`Закрыл попап`);
	}
	// Получение хэша 
	_getHash() {
		if (this.options.hashSettings.location) {
			this.hash = this.targetOpen.selector.includes('#') ?
				this.targetOpen.selector : this.targetOpen.selector.replace('.', '#')
		}
	}
	_openToHash() {
		let classInHash = document.querySelector(`.${window.location.hash.replace('#', '')}`) ? `.${window.location.hash.replace('#', '')}` :
			document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` :
				null;

		const buttons = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`);
		if (buttons) {
			if (classInHash) this.open(classInHash)
		}
	}
	// Утсановка хэша
	_setHash() {
		history.pushState('', '', this.hash);
	}
	_removeHash() {
		history.pushState('', '', window.location.href.split('#')[0])
	}
	_focusCatch(e) {
		const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
		const focusArray = Array.prototype.slice.call(focusable);
		const focusedIndex = focusArray.indexOf(document.activeElement);

		if (e.shiftKey && focusedIndex === 0) {
			focusArray[focusArray.length - 1].focus();
			e.preventDefault();
		}
		if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
			focusArray[0].focus();
			e.preventDefault();
		}
	}
	_focusTrap() {
		const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
		if (!this.isOpen && this.lastFocusEl) {
			this.lastFocusEl.focus();
		} else {
			focusable[0].focus();
		}
	}
	// Функция вывода в консоль
	popupLogging(message) {
		this.options.logging ? FLS(`[Попапос]: ${message}`) : null;
	}
}
// Запускаем и добавляем в объект модулей
flsModules.popup = new Popup({});