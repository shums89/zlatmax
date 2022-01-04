// Подключение функционала "Чертогов Фрилансера"
import { isMobile, menuClose, getHash, FLS } from "../functions.js";
// Подключение дополнения для увеличения возможностей
// Документация: https://github.com/cferdinandi/smooth-scroll
// import SmoothScroll from 'smooth-scroll';
//==============================================================================================================================================================================================================================================================================================================================

// Модуль плавной проктутки к блоку
export let gotoBlock = (targetBlock, noHeader = false, speed = 500, offset = 0) => {
	const targetBlockElement = typeof (targetBlock) === "string" ? document.querySelector(targetBlock) : targetBlock;
	if (targetBlockElement) {
		let headerItem = '';
		let headerItemHeight = 0;
		if (noHeader) {
			headerItem = 'header.header';
			headerItemHeight = document.querySelector(headerItem).offsetHeight;
		}
		let options = {
			speedAsDuration: true,
			speed: speed,
			header: headerItem,
			offset: offset,
			easing: 'easeOutQuad',
		};
		// Закрываем меню, если оно открыто
		document.documentElement.classList.contains("menu-open") ? menuClose() : null;

		if (typeof SmoothScroll !== 'undefined') {
			// Прокрутка с использованием дополнения
			new SmoothScroll().animateScroll(targetBlockElement, '', options);
		} else {
			// Прокрутка стандартными средствами
			let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
			window.scrollTo({
				top: headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition,
				behavior: "smooth"
			});
		}
		FLS(`[gotoBlock]: Юхуу...едем к ${targetBlock}`);
	} else {
		FLS(`[gotoBlock]: Ой ой..Такого блока нет на странице: ${targetBlock}`);
	}
};