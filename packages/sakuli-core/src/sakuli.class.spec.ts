jest.mock('fs');

import {Sakuli, SakuliClass} from "./sakuli.class";
import {SakuliExecutionContextProvider} from "./runner/test-execution-context";
import {SakuliPresetRegistry} from "./sakuli-preset-registry.class";
import {Project} from "./loader";
import {stripIndent} from "common-tags";
import {MockFsLayout} from "@sakuli/commons";
import {readFileSync} from "fs";

describe('Sakuli', () => {

    it('should always return same instance of SakuliClass', () => {
        expect(
            Sakuli([])
        ).toBe(
            Sakuli([])
        )
    });

    describe('SakuliClass', () => {

        it('Should have at least the sakuli context provider', () => {
            const sakuli = new SakuliClass([]);
            expect(sakuli.contextProviders.length).toBe(1);
            expect(sakuli.contextProviders[0]).toBeInstanceOf(SakuliExecutionContextProvider);
        });

        it('Should have at least one forwarder', () => {
            const sakuli = new SakuliClass([]);
            expect(sakuli.forwarder.length).toBe(1);
        });

        it('should have no loaders', () => {
            const sakuli = new SakuliClass([]);
            expect(sakuli.loader.length).toBe(0);
        });

        it('should throw because no project could be created', async done => {
            const sakuli = new SakuliClass([]);
            try {
                await sakuli.run('dummy/path');
                done.fail();
            } catch (e) {
                done()
            }
        });

        it('should execute correctly', async done => {
            const fsLayout = new MockFsLayout({
                'project-dir': {
                    'test1.js': stripIndent`
                    Sakuli().testExecutionContext.startTestSuite({id: 'My Suite'});                    
                    Sakuli().testExecutionContext.endTestSuite();
                `
                }
            });
            (<jest.Mock<typeof readFileSync>>readFileSync).mockImplementation((path: string) => {
                return fsLayout.getFile(path);
            });
            const sakuli = new SakuliClass([
                (<any>jest.fn)((reg: SakuliPresetRegistry) => {
                    reg.registerProjectLoader({
                        load: (<any>jest.fn)((root: string): Project => ({
                            rootDir: root,
                            testFiles: [
                                {path: 'test1.js'}
                            ]
                        }))
                    })
                })
            ]);

            await sakuli.run('project-dir');
            done();
        })

    });
});