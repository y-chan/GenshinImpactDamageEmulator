const CHARA_LV_STEP = [20, 40, 50, 60, 70, 80];
const TALENT_LV_MAX = 15;

const BONUS_UNIT = {
    other: { name: "その他", unit: "n" },
    hp: { name: "HP", unit: "i" },
    hp_buf: { name: "HP(%)", unit: "f" },
    atk: { name: "攻撃力", unit: "i" },
    atk_buf: { name: "攻撃力(%)", unit: "f" },
    atk_base: { name: "基礎攻撃力", unit: "f" },
    def: { name: "防御力", unit: "i" },
    def_buf: { name: "防御力(%)", unit: "f" },
    elem: { name: "元素熟知", unit: "i" },
    en_rec: { name: "元素ﾁｬｰｼﾞ率", unit: "f" },
    cri_rate: { name: "会心率", unit: "f" },
    cri_dmg: { name: "会心ダメージ", unit: "f" },
    any_dmg: { name: "ダメージ", unit: "f" },
    elem_dmg: { name: "元素バフ", unit: "f" },
    pyro_dmg: { name: "炎元素バフ", unit: "f" },
    hydro_dmg: { name: "水元素バフ", unit: "f" },
    elect_dmg: { name: "雷元素バフ", unit: "f" },
    anemo_dmg: { name: "風元素バフ", unit: "f" },
    cryo_dmg: { name: "氷元素バフ", unit: "f" },
    geo_dmg: { name: "岩元素バフ", unit: "f" },
    phys_dmg: { name: "物理バフ", unit: "f" },
    normal_dmg: { name: "通常攻撃ダメ", unit: "f" },
    heavy_dmg: { name: "重撃ダメ", unit: "f" },
    heavy_cri: { name: "重撃会心率", unit: "f" },
    skill_dmg: { name: "スキルダメ", unit: "f" },
    burst_dmg: { name: "元素爆発ダメ", unit: "f" },
    react_dmg: { name: "元素反応ダメ", unit: "f" },
};

function getBonusUnit(id) {
    if (id in BONUS_UNIT) {
        return BONUS_UNIT[id];
    }
    return BONUS_UNIT.other;
};

class Status {
    constructor() {
        this.chara = null;
        this.lv = "0";
        this.bonus = [];
        this.talent = [0, 0, 0];
        this.base_hp = 0;
        this.hp = 0;
        this.hp_buf = 0.0;
        this.base_atk = 0;
        this.atk_rate = 0.0;
        this.atk = 0;
        this.atk_buf = 0.0;
        this.base_def = 0;
        this.def = 0;
        this.def_buf = 0.0;
        this.elem = 0;
        this.en_rec = 0.0;
        this.cri_rate = 0.0;
        this.cri_dmg = 0.0;
        this.any_dmg = 0.0;
        this.elem_dmg = 0.0;
        this.pyro_dmg = 0.0;
        this.hydro_dmg = 0.0;
        this.elect_dmg = 0.0;
        this.anemo_dmg = 0.0;
        this.cryo_dmg = 0.0;
        this.geo_dmg = 0.0;
        this.phys_dmg = 0.0;
        this.normal_dmg = 0.0;
        this.heavy_dmg = 0.0;
        this.heavy_cri = 0.0;
        this.skill_dmg = 0.0;
        this.burst_dmg = 0.0;
    }
};

class Bonus {
    constructor(items, value, limit = null, times = 0, stack = 0) {
        if (Array.isArray(items)) {
            this.items = items;
        } else {
            this.items = [items];
        }
        this.value = value;
        this.limit = limit;
        this.times = times;
        this.stack = stack;
    }

    append(status, limit = null) {
        if (this.limit == limit) {
            for (let i = 0; i < this.items.length; ++i) {
                status[this.items[i]] += this.value;
            }
            return true;
        }
        return false;
    }
};

const TEAM_BONUS = {
    pyro: new Bonus("atk_buf", 25),
    cryo: new Bonus("cri_rate", 15, "氷元素付着または凍結状態の敵"),
    geo: new Bonus("any_dmg", 15, "シールドが存在する時")
};

const CHARACTER = {
    TravelAnemo: { name: "旅人(風)", star: 5, element: "anemo", weapon: "sword", special: "atk_buf" },
    TravelGeo: { name: "旅人(岩)", star: 5, element: "geo", weapon: "sword", special: "atk_buf" },
    Amber: { name: "アンバー", star: 4, element: "pyro", weapon: "bow", special: "atk_buf" },
    Barbara: { name: "バーバラ", star: 4, element: "hydro", weapon: "catalyst", special: "hp_buf" },
    Beidou: { name: "北斗", star: 4, element: "elect", weapon: "claymore", special: "elect_dmg" },
    Bennett: { name: "ベネット", star: 4, element: "pyro", weapon: "sword", special: "en_rec" },
    Chongyun: { name: "重雲", star: 4, element: "cryo", weapon: "claymore", special: "atk_buf" },
    Diluc: { name: "ディルック", star: 5, element: "pyro", weapon: "claymore", special: "cri_rate" },
    Diona: { name: "ディオナ", star: 4, element: "cryo", weapon: "bow", special: "other" },
    Fischl: { name: "フィッシュル", star: 4, element: "electo", weapon: "bow", special: "atk_buf" },
    Jean: { name: "ジン", star: 5, element: "anemo", weapon: "sword", special: "other" },
    Kaeya: { name: "ガイア", star: 4, element: "cryo", weapon: "sword", special: "en_rec" },
    Keqing: { name: "刻晴", star: 5, element: "elect", weapon: "sword", special: "cri_dmg" },
    Klee: { name: "クレー", star: 5, element: "pyro", weapon: "sword", special: "pyro_dmg" },
    Lisa: { name: "リサ", star: 4, element: "elect", weapon: "catalyst", special: "elem" },
    Mona: { name: "モナ", star: 5, element: "hydro", weapon: "catalyst", special: "en_rec" },
    Ningguang: { name: "凝光", star: 4, element: "geo", weapon: "catalyst", special: "geo_dmg" },
    Noelle: { name: "ノエル", star: 4, element: "geo", weapon: "claymore", special: "def_buf" },
    Qiqi: { name: "七七", star: 5, element: "cryo", weapon: "sword", special: "other" },
    Razor: { name: "レザー", star: 4, element: "elect", weapon: "claymore", special: "phys_dmg" },
    Sucrose: { name: "スクロース", star: 4, element: "anemo", weapon: "catalyst", special: "anemo_dmg" },
    Tartaglia: { name: "タルタリヤ", star: 5, element: "hydro", weapon: "bow", special: "other" },
    Venti: { name: "ウェンティ", star: 5, element: "anemo", weapon: "bow", special: "en_rec" },
    Xiangling: { name: "香菱", star: 4, element: "pyro", weapon: "polearm", special: "elem" },
    Xiao: { name: "魈", star: 5, element: "anemo", weapon: "polearm", special: "other" },
    Xingqiu: { name: "行秋", star: 4, element: "hydro", weapon: "sword", special: "atk_buf" },
    Xinyan: { name: "辛炎", star: 4, element: "pyro", weapon: "claymore", special: "other" },
    Zhongli: { name: "鍾離", star: 5, element: "geo", weapon: "polearm", special: "other" },
};