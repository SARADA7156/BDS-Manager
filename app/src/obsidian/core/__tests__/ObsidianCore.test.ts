import { logger } from "../../../services/log/logger";
import { ObsidianCore } from "../ObsidianCore";

jest.mock('../../../services/log/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    }
}));

describe('ObsidianCore', () => {
    let obsidian: ObsidianCore;

    // beforeEach(() => {
    //     jest.clearAllMocks();
    //     obsidian = new ObsidianCore();
    // });

    // test('createServerが開始ログを出すこと', () => {
    //     obsidian.createServer('path/to/server');
    //     expect(logger.info).toHaveBeenCalledWith('Check the available port numbers.');
    // });

    // test('利用可能なポートがない場合はエラーを返すこと', () => {
    //     // portsを直接すべて使用中に設定
    //     (obsidian as any).ports.forEach((p: any) => p.used = true);

    //     const result = obsidian.createServer('/path/to/server');
    //     expect(result).toEqual({
    //         result: false,
    //         message: 'The maximum number of instances has been reached.'
    //     });
    //     expect(logger.error).toHaveBeenCalledWith('The maximum number of instances has been reached.');
    // });
});