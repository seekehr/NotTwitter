export default interface IDatabaseManager {
    init(): Promise<boolean>;
}