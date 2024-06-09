function convertLanguage(lang) {
	switch (lang) {
		case "JP":
			difficulties.names = ["かんたん", "ふつう", "むずい", "おに", "うら"]
			
			selected.settings.names[0] = "音量 (%)";
			selected.settings.names[1] = "譜面オフセット (ms)";
			selected.settings.names[2] = "ノーツに音で影響与";
			selected.settings.names[3] = "デフォルトのゲージ";
			selected.settings.names[5] = "最大のFPS";
			selected.settings.names[6] = "最大のTPS";
			selected.settings.names[7] = ".tjaアップロードする";
			
			if (selected.settings.amounts[3] == "None") selected.settings.amounts[3] = "なし"
			
			selected.settings.descriptions[1] = "譜面オフセットをms位で設定する。";
			selected.settings.descriptions[3] = "デフォルトのクリアゲージの種類設定する。\n「Easier」「Easy」「Normal」太鼓のゲージのように動作する。\n「Hard」「EXHard」「GAS」BMSのゲージのように動作する。\n\n「なし」選択なら、ゲージは選択した難易度に基づく。"
			selected.settings.descriptions[5] = "ゲームの最大FPS設定する。";
			selected.settings.descriptions[6] = "ゲームの最大TPS設定する。\n(TPSとは1秒のティック数です)";
			
			gaugeNames[0] = "なし";
		break;
	}
}