import { relative, resolve, sep } from "path";
import { CORE_STATUS } from "../errors/coreStatus";
import { ObsidianParamError } from "../errors/ObsidianParamError";

export function validatePath(projectRoot: string, targetPath: string, name: string): string {
        if (typeof targetPath !== 'string' || targetPath.trim().length === 0) {
            throw new ObsidianParamError(CORE_STATUS.FILE_ACCESS_DENIED, `${name} is invalid path`)
        }

        const absPath = resolve(targetPath);
        const relPath = relative(projectRoot, absPath);

        // ルートより上の階層を指定している場合は拒否
        if (relPath.startsWith('..') || relPath.includes(`..${sep}`)) {
            throw new ObsidianParamError(CORE_STATUS.FILE_ACCESS_DENIED, 'You cannot specify the parent directory.')
        }

        return absPath;
    }
