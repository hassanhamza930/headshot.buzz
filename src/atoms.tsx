import { atom } from "recoil";

export const linesAtom=atom({
    key:"lines",
    default:[
        "Hey there everyone",
        "Today, i'm gonna show you how to sound 100x more confident on a video",
        "The Answer? Just use teleprompters like this one",
    ] as Array<string>,
});