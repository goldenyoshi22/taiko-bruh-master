function convertLanguage(lang) {
	switch (lang) {
		case "JP":
			difficulties.names = ["かんたん", "ふつう", "むずい", "おに", "うら"]
			selected.settings.names = ["音量 (%)", "譜面オフセット (ms)", "ノーツに音で影響与", "デフォルトのゲージ", ".tjaアップロードする"]
			selected.settings.descriptions = [
			selected.settings.descriptions[0],
			"[ゲームプレイ]\n譜面オフセットをms位で設定する。",
			selected.settings.descriptions[2],
			selected.settings.descriptions[3],
			selected.settings.descriptions[4]
			]
		break;
	}
}