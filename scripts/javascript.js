const lPanel = document.querySelector(".left-panel")
const rPanel = document.querySelector(".right-panel")
const div = document.getElementById("div-content")
const yt = document.querySelector("iframe")
const origin = window.location.origin
let ytTime = 600

document.addEventListener("click", (e) => {
	const wClick = e.target
	if (!wClick.closest(".left-panel") && !wClick.closest(".right-panel")) {
		showPanel(wClick)
	}
	if (wClick.closest("#youtube")) {
		if (yt.getAttribute("aria-hidden") === "true") {
			yt.setAttribute("aria-hidden", "false")
			yt.setAttribute("src", ytUrl(1))
			return
		}

		yt.setAttribute("src", ytUrl(0))
		yt.setAttribute("aria-hidden", "true")
	}
})

document.addEventListener("mouseover", (e) => {
	const wHover = e.target

	if (lPanel.getAttribute("aria-hidden") === "true") {
		if (wHover.closest("#lounge")) {
			lPanel.setAttribute("data-hover", "true")
			return
		}
	}

	if (rPanel.getAttribute("aria-hidden") === "true") {
		if (wHover.closest("#office")) {
			rPanel.setAttribute("data-hover", "true")
			return
		}
	}

	lPanel.setAttribute("data-hover", "false")
	rPanel.setAttribute("data-hover", "false")
})

document.addEventListener("change", (e) => {
	if (e.target.id == "tab-close") {
		div.setAttribute("aria-hidden", "true")
		return
	}

	if (e.target.id == "chk-news") {
		document.getElementById("tab-close").checked = true

		if (e.target.checked) {
			document.getElementById("div-news").setAttribute("aria-hidden", "false")
			return
		}
		document.getElementById("div-news").setAttribute("aria-hidden", "true")
		div.setAttribute("aria-hidden", "true")
		return
	}

	div.setAttribute("aria-hidden", "false")

	xmlFetch(e.target.id)
})

document.addEventListener("keydown", (key) => {

	if (document.activeElement.nodeName.toLowerCase() == "input") {
		return		
	}
	ytTime >= 600? ytTime : 600

	switch(key.code)
	{
		case "Space":

			if(yt.getAttribute("aria-hidden") === "true") {
				return
			}

			if (yt.getAttribute("data-paused") == "false") {
				yt.contentWindow.postMessage(
					'{"event":"command","func":"' + "pauseVideo" + '","args":""}',
					ytUrl(1)
				)
				yt.setAttribute("data-paused", "true")
				return
			}

			yt.contentWindow.postMessage(
				'{"event":"command","func":"' + "playVideo" + '","args":""}',
				ytUrl(1)
			)
			yt.setAttribute("data-paused", "false")
			break

		case "ArrowRight":						
			yt.contentWindow.postMessage(
				JSON.stringify({ event: 'command', func: 'seekTo', args: [ytTime, true] }),
				ytUrl(1)
			)
			ytTime += 600
			break

		case "ArrowLeft":
			ytTime -= 600
			yt.contentWindow.postMessage(
				JSON.stringify({ event: 'command', func: 'seekTo', args: [ytTime, true] }),
				ytUrl(1)
			)
			break

		default:
			break
	}
})

function ytUrl(play) {
	return `https://www.youtube-nocookie.com/embed/8plwv25NYRo?origin=${origin}&enablejsapi=1&showinfo=0&autoplay=${play}`
}

function showPanel(targ) {
	const lShown = lPanel.getAttribute("aria-hidden") === "false"
	const rShown = rPanel.getAttribute("aria-hidden") === "false"

	if (targ.closest("#office")) {
		if (!rShown) {
			rPanel.setAttribute("data-hover", "false")
			rPanel.setAttribute("aria-hidden", "false")
			return
		}

		rPanel.setAttribute("aria-hidden", "true")
		rPanel.setAttribute("data-hover", "true")
		return
	} else if (targ.closest("#lounge")) {
		if (!lShown) {
			lPanel.setAttribute("aria-hidden", "false")
			lPanel.setAttribute("data-hover", "false")
			return
		}

		lPanel.setAttribute("aria-hidden", "true")
		lPanel.setAttribute("data-hover", "true")
		return
	}

	lPanel.setAttribute("aria-hidden", "true")
	rPanel.setAttribute("aria-hidden", "true")
}

function dateTime() {
	const txtTime = document.getElementById("timedate")
	let dTime = new Date().toLocaleTimeString()
	let todayDate = new Date().toLocaleDateString()

	txtTime.innerText = todayDate + "|" + dTime
	txtTime.setAttribute(
		"datetime",
		new Date().getFullYear() +
			"-" +
			(new Date().getMonth() + 1) +
			"-" +
			new Date().getDate() +
			" " +
			dTime
	)
}
async function currentWeather() {
	const temp = document.getElementById("temp")
	const icon = document.getElementById("icone")
	const umi = document.getElementById("umidade")
	const apiKey = "ba747fa8087338bff8ca496078237c1d"
	const weatherApi = `https://api.openweathermap.org/data/2.5/weather?
	lat=-23.5017&lon=-47.4581&lang=pt&appid=${apiKey}&units=metric`

	const result = await fetch(weatherApi).then((result) => result.json())

	temp.innerText = parseInt(result.main.temp)
	icon.setAttribute(
		"src",
		`https://openweathermap.org/img/wn/${result.weather[0].icon}.png`
	)
	icon.setAttribute("alt", result.weather[0].description)
	umi.innerText = result.main.humidity

	headTitle()
}

function headTitle() {

	const days = [
		"Domingo",
		"Segunda-feira",
		"Terça-feira",
		"Quarta-feira",
		"Quinta-feira",
		"Sexta-feira",
		"Sábado",
	]
	const mTitle = document.getElementById("mtitle")
	const clima = document.getElementById("icone").getAttribute("alt")
	mTitle.innerText = `Hoje é ${days[new Date().getDay()]}, o clima é de ${clima}.`
	document.getElementById("speech").setAttribute("style", "display:inline")
}

function txtSpeech() {
	let utter = new SpeechSynthesisUtterance()
	utter.text = document.getElementById("mtitle").innerText
	utter.lang = "pt-BR"
	window.speechSynthesis.speak(utter)
}

async function xmlFetch(tab) {
	while (div.hasChildNodes()) {
		div.removeChild(div.lastChild)
	}
	switch (tab) {
		case "tab-geral":
			rssFeed("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fextra.globo.com%2Fnoticias%2Frss.xml")
			break
		case "tab-dev":
			await fetch("https://dev.to/feed/gitlive")
					.then((response) => response.text())
					.then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
					.then((data) => {
						const items = data.querySelectorAll("item")
						items.forEach((item) => {
							const title = item.querySelector("title").textContent
							const desc = item.querySelector("description").textContent
							const child1 = document.createElement("h1")
							child1.innerHTML = title
							div.appendChild(child1)
							const child2 = document.createElement("p")
							child2.innerHTML = desc
							div.appendChild(child2)
						})
					})
			break
		case "tab-econ":
			rssFeed(" https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fextra.globo.com%2Feconomia-e-financas%2Frss.xml")
			break
		case "tab-tech":
		rssFeed("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frss.tecmundo.com.br%2Ffeed")
			break
	}
}

async function rssFeed(url){
	let data = await fetch(url).then((response) => response.json())
	data.items.forEach((item) => {
		const title = item.title
		const desc = item.description
		const child1 = document.createElement("h1")
		child1.innerHTML = title
		div.appendChild(child1)
		const child2 = document.createElement("p")
		child2.innerHTML = desc
		div.appendChild(child2)
	})
}

dateTime()
currentWeather()
setInterval(dateTime, 1000)
setInterval(() => {	currentWeather(), headTitle()}, 1000 * 60 * 5)
