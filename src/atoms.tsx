import { atom } from "recoil";

export const linesAtom=atom({
    key:"lines",
    default:[
        "Aukhe Samein chon sab ne langna man nu tu smjha",
        "Baba nanak nal hai bandya tura turya jaa",
        "Mushkilan hazaran ne aake tere nal milna",
    ] as Array<string>,
});