import {Environment} from "./environment.class";
import {describe} from "selenium-webdriver/testing";
import {ENCRYPTION_KEY_VARIABLE} from "./secrets.function";

describe("Similarity ", () => {
    it("should have a default value of 0.8", async () => {
        // GIVEN
        const SUT = new Environment();
        const expectedResult = 0.8;

        // WHEN

        // THEN
        expect(SUT.getSimilarity()).toEqual(expectedResult);
    });

    it("should not update for value <= 0", async () => {
        // GIVEN
        const SUT = new Environment();
        const expectedResult = 0.8;

        // WHEN
        SUT.setSimilarity(-10);

        // THEN
        expect(SUT.getSimilarity()).toEqual(expectedResult);
    });

    it("should not update for value == 0", async () => {
        // GIVEN
        const SUT = new Environment();
        const expectedResult = 0.8;

        // WHEN
        SUT.setSimilarity(0);

        // THEN
        expect(SUT.getSimilarity()).toEqual(expectedResult);
    });

    it("should not update for values > 1", async () => {
        // GIVEN
        const SUT = new Environment();
        const expectedResult = 0.8;

        // WHEN
        SUT.setSimilarity(10);

        // THEN
        expect(SUT.getSimilarity()).toEqual(expectedResult);
    });

    it("should reset to its default value", async () => {
        // GIVEN
        const SUT = new Environment();
        const expectedResult = 0.8;

        // WHEN
        SUT.setSimilarity(0.6);
        SUT.resetSimilarity();

        // THEN
        expect(SUT.getSimilarity()).toEqual(expectedResult);
    });
});

describe("sleep", () => {
    it("should pause execution for a given delay in seconds", async () => {
        // GIVEN
        const SUT = new Environment();
        const pauseInSeconds = 1;
        const expectedPauseInMilliseconds = 1000;
        const start = Date.now();

        // WHEN
        await SUT.sleep(pauseInSeconds);
        const stop = Date.now();

        // THEN
        expect(stop - start).toBeGreaterThanOrEqual(expectedPauseInMilliseconds);
    });

    it("should pause execution for a given delay in ms", async () => {
        // GIVEN
        const SUT = new Environment();
        const expectedPause = 200;
        const start = Date.now();

        // WHEN
        await SUT.sleepMs(expectedPause);
        const stop = Date.now();

        // THEN
        expect(stop - start).toBeGreaterThanOrEqual(expectedPause);
    });
});

describe("getEnv", () => {
    it("should return an existing variables value", async () => {
        // GIVEN
        const SUT = new Environment();
        const variableKey = "sakuliEnvVar";
        const variableValue = "Hi from Sakuli!";
        process.env[variableKey] = variableValue;

        // WHEN
        const result = await SUT.getEnv(variableKey);

        // THEN
        expect(result).toBe(variableValue);
    });

    it("should return undefined for unknown variables", async () => {
        // GIVEN
        const SUT = new Environment();
        const variableKey = "unknownVar";

        // WHEN
        const result = await SUT.getEnv(variableKey);

        // THEN
        expect(result).toBeUndefined();
    });
});

describe("type", () => {
    it("should type via keyboard", async () => {
        // GIVEN
        const SUT = new Environment();

        // WHEN

        // THEN
        await expect(SUT.type("Hello from Sakuli!")).not.toThrow();
    });

    it("should decrypt and type via keyboard", async () => {
        // GIVEN
        const SUT = new Environment();
        process.env[ENCRYPTION_KEY_VARIABLE] = "C9HikSYQW/K+ZvRphxEuSw==";
        const input = "LAe8iDYgcIu/TUFaRSeJibKRE7L0gV2Bd8QC976qRqgSQ+cvPoXG/dU+6aS5+tXC";

        // WHEN

        // THEN
        await expect(SUT.typeAndDecrypt(input)).resolves.not.toThrow();
    });

    it("should throw when no encryption key is set via env var", async () => {
        // GIVEN
        const SUT = new Environment();
        const input = "LAe8iDYgcIu/TUFaRSeJibKRE7L0gV2Bd8QC976qRqgSQ+cvPoXG/dU+6aS5+tXC";

        // WHEN

        // THEN
        await expect(SUT.typeAndDecrypt(input)).rejects.toThrow(`'${ENCRYPTION_KEY_VARIABLE}' is empty. Missing master key for secrets.`);
    });
});