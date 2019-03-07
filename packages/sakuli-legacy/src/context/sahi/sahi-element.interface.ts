import {Locator, WebElement} from "selenium-webdriver";
import {SahiRelation} from "./relations/sahi-relation.interface";
import {AccessorIdentifier} from "./api";
import {ifPresent, Maybe} from "@sakuli/commons";
import {stripIndents} from "common-tags";
import {types} from "util";

export interface SahiElementQuery {
    locator: Locator,
    identifier: AccessorIdentifier,
    relations: SahiRelation[]
}

export interface SahiElement {
    element: Maybe<WebElement>,
    query: SahiElementQuery
}

export function isSahiElementQuery(o: any): o is SahiElementQuery {
    return typeof o === "object"
        && 'identifier' in o
        && 'locator' in o
        && 'relations' in o;
}

export function sahiElementQuery(locator: Locator, identifier: AccessorIdentifier, relations: SahiRelation[]): SahiElementQuery {
    return {locator, identifier, relations}
}

export function sahiElement(element: Maybe<WebElement>, query: SahiElementQuery): SahiElement {
    return {element: element, query}
}

export function throwIfElementIsAbsent({element, query}: SahiElement): WebElement {
    return ifPresent(element,
        e => e,
        () => {
            throw Error(stripIndents`
            Cannot resolve an element from
            ${sahiQueryToString(query)}
        `)
        })
}

export function identifierToString(identifier: AccessorIdentifier) {
    if (
        types.isRegExp(identifier) ||
        typeof identifier === 'string' ||
        typeof identifier === 'number') {
        return identifier.toString();
    } else {
        return JSON.stringify(identifier);
    }
}

export function sahiQueryToString({locator, relations, identifier}: SahiElementQuery) {
    return stripIndents`
        Locator: ${locator.toString()}
        identifier: ${identifierToString(identifier)}
        relations: ${relations.map(f => f.name).join(', ')}
    `
}