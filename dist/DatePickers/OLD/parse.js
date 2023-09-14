import { getMonthLength } from "./date-utils";
/** Parse a string according to the supplied format tokens. Returns a date if successful, and the missing punctuation if there is any that should be after the string */
export function parse(str, tokens, baseDate) {
    let missingPunctuation = "";
    let valid = true;
    baseDate = baseDate || new Date(2020, 0, 1, 0, 0, 0, 0);
    let year = baseDate.getFullYear();
    let month = baseDate.getMonth();
    let day = baseDate.getDate();
    let hours = baseDate.getHours();
    let minutes = baseDate.getMinutes();
    let seconds = baseDate.getSeconds();
    // const ms = baseDate.getMilliseconds();
    function parseString(token) {
        for (let i = 0; i < token.length; i++) {
            if (str.startsWith(token[i])) {
                str = str.slice(1);
            }
            else {
                valid = false;
                if (str.length === 0) {
                    missingPunctuation = token.slice(i);
                    return;
                }
            }
        }
    }
    function parseUint(pattern, min, max) {
        const matches = str.match(pattern);
        if (matches?.[0]) {
            str = str.slice(matches[0].length);
            const n = parseInt(matches[0]);
            if (n > max || n < min) {
                valid = false;
                return null;
            }
            else {
                return n;
            }
        }
        else {
            valid = false;
            return null;
        }
    }
    function parseToken(token) {
        if (typeof token === "string") {
            parseString(token);
        }
        else if (token.id === "yyyy") {
            const value = parseUint(/^[0-9]{4}/, 0, 9999);
            if (value !== null) {
                year = value;
            }
        }
        else if (token.id === "MM") {
            const value = parseUint(/^[0-9]{2}/, 1, 12);
            if (value !== null) {
                month = value - 1;
            }
        }
        else if (token.id === "dd") {
            const value = parseUint(/^[0-9]{2}/, 1, 31);
            if (value !== null) {
                day = value;
            }
        }
        else if (token.id === "HH") {
            const value = parseUint(/^[0-9]{2}/, 0, 23);
            if (value !== null) {
                hours = value;
            }
        }
        else if (token.id === "mm") {
            const value = parseUint(/^[0-9]{2}/, 0, 59);
            if (value !== null) {
                minutes = value;
            }
        }
        else if (token.id === "ss") {
            const value = parseUint(/^[0-9]{2}/, 0, 59);
            if (value !== null) {
                seconds = value;
            }
        }
    }
    for (const token of tokens) {
        parseToken(token);
        if (!valid)
            break;
    }
    const monthLength = getMonthLength(year, month);
    if (day > monthLength) {
        valid = false;
    }
    return {
        // I have removed the hours, minutes, seconds, and ms from the Date object that gets returned because I only want this to be a date picker, not a date and time picker.
        // date: valid ? new Date(year, month, day, hours, minutes, seconds, ms) : null,
        date: valid ? new Date(year, month, day) : null,
        missingPunctuation: missingPunctuation,
    };
}
function twoDigit(value) {
    return ("0" + value.toString()).slice(-2);
}
const ruleTokens = [
    {
        id: "yyyy",
        toString: (d) => d.getFullYear().toString(),
    },
    {
        id: "MM",
        toString: (d) => twoDigit(d.getMonth() + 1),
    },
    {
        id: "dd",
        toString: (d) => twoDigit(d.getDate()),
    },
    {
        id: "HH",
        toString: (d) => twoDigit(d.getHours()),
    },
    {
        id: "mm",
        toString: (d) => twoDigit(d.getMinutes()),
    },
    {
        id: "ss",
        toString: (d) => twoDigit(d.getSeconds()),
    },
];
function parseRule(s) {
    for (const token of ruleTokens) {
        if (s.startsWith(token.id)) {
            return token;
        }
    }
}
export function createFormat(s) {
    const tokens = [];
    while (s.length > 0) {
        const token = parseRule(s);
        if (token) {
            // parsed a token like "yyyy"
            tokens.push(token);
            s = s.slice(token.id.length);
        }
        else if (typeof tokens[tokens.length - 1] === "string") {
            // last token is a string token, so append to it
            tokens[tokens.length - 1] += s[0];
            s = s.slice(1);
        }
        else {
            // add string token
            tokens.push(s[0]);
            s = s.slice(1);
        }
    }
    return tokens;
}
