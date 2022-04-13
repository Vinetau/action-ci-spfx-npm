import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as github from "@actions/github";

async function main() {
	try {
		const context = github.context;
		core.info(`Building and testing solution (ref: ${context.ref})...`);
		core.info("(1/5) Install cross-env");
		await exec(`npm i -g cross-env`);
		core.info("(2/5) Install");
		await exec(`npm ci`);
		core.info("(3/5) Build");
		await exec(`npm run uat-bundle`);
		core.info("(4/5) Test");
		await exec(`npm run test`);
		core.info("(5/5) Package");
		await exec(`npm run uat-package-solution`);
		core.info(`✅ complete`);
	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}

main();
