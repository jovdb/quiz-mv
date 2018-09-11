declare global {
	interface IScore {
		male: number;
		female: number;
	}
}

export class Score implements IScore {

	public male: number;
	public female: number;

	constructor(data: IScore) {
		this.female = data.female;
		this.male = data.male;
	}
}
