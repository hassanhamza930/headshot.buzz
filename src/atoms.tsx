import { atom } from "recoil";

export const linesAtom=atom({
    key:"lines",
    default:[] as Array<string>,
});