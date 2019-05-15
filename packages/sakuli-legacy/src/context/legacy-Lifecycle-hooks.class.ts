import {Builder, Capabilities, ThenableWebDriver} from 'selenium-webdriver';
import {ifPresent, Maybe, throwIfAbsent} from "@sakuli/commons";
import {createTestCaseClass} from "./common/test-case.class";
import {Key} from "./common/key.class";
import {createEnvironmentClass} from "./common/sakuli-environment.class";
import {sahiApi} from "./sahi/api";
import {Project, TestExecutionContext, TestExecutionLifecycleHooks} from "@sakuli/core";
import {TestFile} from "@sakuli/core/dist/loader/model/test-file.interface";
import {parse, sep} from "path";
import {createLoggerClass} from "./common/logger.class";
import {LegacyProjectProperties} from "../loader/legacy-project-properties.class";
import {createRegionClass} from "./common/sakuli-region.class";
import {createApplicationClass} from "./common/sakuli-application.class";
import {CapabilitiesBuilderInterface, GenericCapabilitiesBuilder} from "../loader/capabilities-builder.class";
import {ChromeCapabilitiesBuilder} from "../loader/chrome-capabilities-builder.class";

export class LegacyLifecycleHooks implements TestExecutionLifecycleHooks {


    capabilityMap: { [key: string]: (project : Project) => CapabilitiesBuilderInterface } = {
        'chrome': (project) => new ChromeCapabilitiesBuilder(project),
        'firefox': (project) => new GenericCapabilitiesBuilder(project),
        'edge': (project) => new GenericCapabilitiesBuilder(project),
        'safari': (project) => new GenericCapabilitiesBuilder(project),
        'ie': (project) => new GenericCapabilitiesBuilder(project),
        'phantomjs': (project) => new GenericCapabilitiesBuilder(project),
        'htmlunit': (project) => new GenericCapabilitiesBuilder(project),
        'htmlunitwithjs': (project) => new GenericCapabilitiesBuilder(project),
    };
    driver: Maybe<ThenableWebDriver> = null;

    constructor(
        readonly builder: Builder
    ) {

    }

    async onProject(project: Project) {
        //const props: LegacyProjectProperties = project.
        const properties = project.objectFactory(LegacyProjectProperties);
        const browser: keyof typeof Capabilities = properties.testsuiteBrowser;
        const capsBuilderProducer = throwIfAbsent(this.capabilityMap[browser], Error(`${browser} is not a valid browser`));
        const capsBuilder = capsBuilderProducer(project);

        this.driver = this.builder
            .forBrowser(browser)
            .withCapabilities(capsBuilder.build())
            .build();
    }

    async beforeExecution(project: Project, testExecutionContext: TestExecutionContext) {
        const id = project.rootDir.split(sep).pop();
        testExecutionContext.startTestSuite({id})
    }

    async afterExecution(project: Project, testExecutionContext: TestExecutionContext) {
        testExecutionContext.endTestSuite();
        ifPresent(this.driver, async driver => {
            try {
                await driver.quit()
            } catch (e) {
                console.warn(`Webdriver doesn't quit reliably`, e);
            }
        });
    }

    private currentFile: string = '';
    private currentProject: Maybe<Project>;

    async beforeRunFile(file: TestFile, project: Project, ctx: TestExecutionContext) {
        this.currentFile = file.path;
        this.currentProject = project;
    }

    async afterRunFile(file: TestFile, project: Project, ctx: TestExecutionContext) {
        const {name} = parse(file.path);
        ifPresent(ctx.getCurrentTestCase(),
            ctc => {
                if (!ctc.id) {
                    ctx.updateCurrentTestCase({id: name})
                }
            }
        );
    }

    async requestContext(ctx: TestExecutionContext, project: Project) {
        const driver = throwIfAbsent(this.driver,
            Error('Driver could not be initialized before creating sahi-api-context'));
        const sahi = sahiApi(driver, ctx);
        return Promise.resolve({
            driver,
            context: ctx,
            TestCase: createTestCaseClass(ctx, project),
            Application: createApplicationClass(ctx),
            Key,
            Environment: createEnvironmentClass(ctx, project),
            Region: createRegionClass(ctx),
            Logger: createLoggerClass(ctx),
            console: console,
            $includeFolder: '',
            ...sahi,
        })
    }

}
