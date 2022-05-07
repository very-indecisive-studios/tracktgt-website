//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.15.10.0 (NJsonSchema v10.6.10.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

import * as dayjs from 'dayjs';

export class ExtBackendAPIClient {
    protected async transformOptions(options: RequestInit): Promise<RequestInit> {
        options.headers = {
            ...options.headers
            // TODO: Add private API token to Bearer header. 
        }

        return options;
    }
}

export class BackendAPIClient extends ExtBackendAPIClient {
    private http: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> };
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) {
        super();
        this.http = http ? http : window as any;
        this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "https://localhost:7061";
    }

    game_AddTrackedGame(addTrackedGameCommand: AddTrackedGameCommand): Promise<BackendAPIResponse<Unit>> {
        let url_ = this.baseUrl + "/api/game/track/add";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(addTrackedGameCommand);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processGame_AddTrackedGame(_response);
        });
    }

    protected processGame_AddTrackedGame(response: Response): Promise<BackendAPIResponse<Unit>> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = Unit.fromJS(resultData200);
            return new BackendAPIResponse(status, _headers, result200);
            });
        } else if (status === 400) {
            return response.text().then((_responseText) => {
            let result400: any = null;
            let resultData400 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result400 = ProblemDetails.fromJS(resultData400);
            return throwException("A server side error occurred.", status, _responseText, _headers, result400);
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
            let result401: any = null;
            let resultData401 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result401 = ProblemDetails.fromJS(resultData401);
            return throwException("A server side error occurred.", status, _responseText, _headers, result401);
            });
        } else if (status === 403) {
            return response.text().then((_responseText) => {
            let result403: any = null;
            let resultData403 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result403 = ProblemDetails.fromJS(resultData403);
            return throwException("A server side error occurred.", status, _responseText, _headers, result403);
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<BackendAPIResponse<Unit>>(new BackendAPIResponse(status, _headers, null as any));
    }

    game_GetGame(id: number): Promise<BackendAPIResponse<GetGameResult>> {
        let url_ = this.baseUrl + "/api/game/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processGame_GetGame(_response);
        });
    }

    protected processGame_GetGame(response: Response): Promise<BackendAPIResponse<GetGameResult>> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = GetGameResult.fromJS(resultData200);
            return new BackendAPIResponse(status, _headers, result200);
            });
        } else if (status === 400) {
            return response.text().then((_responseText) => {
            let result400: any = null;
            let resultData400 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result400 = ProblemDetails.fromJS(resultData400);
            return throwException("A server side error occurred.", status, _responseText, _headers, result400);
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
            let result401: any = null;
            let resultData401 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result401 = ProblemDetails.fromJS(resultData401);
            return throwException("A server side error occurred.", status, _responseText, _headers, result401);
            });
        } else if (status === 403) {
            return response.text().then((_responseText) => {
            let result403: any = null;
            let resultData403 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result403 = ProblemDetails.fromJS(resultData403);
            return throwException("A server side error occurred.", status, _responseText, _headers, result403);
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<BackendAPIResponse<GetGameResult>>(new BackendAPIResponse(status, _headers, null as any));
    }

    game_SearchGames(title: string | null | undefined): Promise<BackendAPIResponse<SearchGamesResult>> {
        let url_ = this.baseUrl + "/api/game/search?";
        if (title !== undefined && title !== null)
            url_ += "title=" + encodeURIComponent("" + title) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processGame_SearchGames(_response);
        });
    }

    protected processGame_SearchGames(response: Response): Promise<BackendAPIResponse<SearchGamesResult>> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = SearchGamesResult.fromJS(resultData200);
            return new BackendAPIResponse(status, _headers, result200);
            });
        } else if (status === 400) {
            return response.text().then((_responseText) => {
            let result400: any = null;
            let resultData400 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result400 = ProblemDetails.fromJS(resultData400);
            return throwException("A server side error occurred.", status, _responseText, _headers, result400);
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
            let result401: any = null;
            let resultData401 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result401 = ProblemDetails.fromJS(resultData401);
            return throwException("A server side error occurred.", status, _responseText, _headers, result401);
            });
        } else if (status === 403) {
            return response.text().then((_responseText) => {
            let result403: any = null;
            let resultData403 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result403 = ProblemDetails.fromJS(resultData403);
            return throwException("A server side error occurred.", status, _responseText, _headers, result403);
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<BackendAPIResponse<SearchGamesResult>>(new BackendAPIResponse(status, _headers, null as any));
    }

    user_RegisterUser(command: RegisterUserCommand): Promise<BackendAPIResponse<Unit>> {
        let url_ = this.baseUrl + "/api/user/register";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(command);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processUser_RegisterUser(_response);
        });
    }

    protected processUser_RegisterUser(response: Response): Promise<BackendAPIResponse<Unit>> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = Unit.fromJS(resultData200);
            return new BackendAPIResponse(status, _headers, result200);
            });
        } else if (status === 400) {
            return response.text().then((_responseText) => {
            let result400: any = null;
            let resultData400 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result400 = ProblemDetails.fromJS(resultData400);
            return throwException("A server side error occurred.", status, _responseText, _headers, result400);
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
            let result401: any = null;
            let resultData401 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result401 = ProblemDetails.fromJS(resultData401);
            return throwException("A server side error occurred.", status, _responseText, _headers, result401);
            });
        } else if (status === 403) {
            return response.text().then((_responseText) => {
            let result403: any = null;
            let resultData403 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result403 = ProblemDetails.fromJS(resultData403);
            return throwException("A server side error occurred.", status, _responseText, _headers, result403);
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<BackendAPIResponse<Unit>>(new BackendAPIResponse(status, _headers, null as any));
    }

    user_CheckUserExist(query: CheckUserExistQuery): Promise<BackendAPIResponse<CheckUserExistResult>> {
        let url_ = this.baseUrl + "/api/user/checkuserexist";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(query);

        let options_: RequestInit = {
            body: content_,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        return this.transformOptions(options_).then(transformedOptions_ => {
            return this.http.fetch(url_, transformedOptions_);
        }).then((_response: Response) => {
            return this.processUser_CheckUserExist(_response);
        });
    }

    protected processUser_CheckUserExist(response: Response): Promise<BackendAPIResponse<CheckUserExistResult>> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = CheckUserExistResult.fromJS(resultData200);
            return new BackendAPIResponse(status, _headers, result200);
            });
        } else if (status === 400) {
            return response.text().then((_responseText) => {
            let result400: any = null;
            let resultData400 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result400 = ProblemDetails.fromJS(resultData400);
            return throwException("A server side error occurred.", status, _responseText, _headers, result400);
            });
        } else if (status === 401) {
            return response.text().then((_responseText) => {
            let result401: any = null;
            let resultData401 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result401 = ProblemDetails.fromJS(resultData401);
            return throwException("A server side error occurred.", status, _responseText, _headers, result401);
            });
        } else if (status === 403) {
            return response.text().then((_responseText) => {
            let result403: any = null;
            let resultData403 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result403 = ProblemDetails.fromJS(resultData403);
            return throwException("A server side error occurred.", status, _responseText, _headers, result403);
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<BackendAPIResponse<CheckUserExistResult>>(new BackendAPIResponse(status, _headers, null as any));
    }
}

/** Represents a void type, since Void is not a valid return type in C#. */
export class Unit implements IUnit {

    constructor(data?: IUnit) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
    }

    static fromJS(data: any): Unit {
        data = typeof data === 'object' ? data : {};
        let result = new Unit();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        return data;
    }
}

/** Represents a void type, since Void is not a valid return type in C#. */
export interface IUnit {
}

export class ProblemDetails implements IProblemDetails {
    type?: string | undefined;
    title?: string | undefined;
    status?: number | undefined;
    detail?: string | undefined;
    instance?: string | undefined;

    constructor(data?: IProblemDetails) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.type = _data["type"];
            this.title = _data["title"];
            this.status = _data["status"];
            this.detail = _data["detail"];
            this.instance = _data["instance"];
        }
    }

    static fromJS(data: any): ProblemDetails {
        data = typeof data === 'object' ? data : {};
        let result = new ProblemDetails();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["type"] = this.type;
        data["title"] = this.title;
        data["status"] = this.status;
        data["detail"] = this.detail;
        data["instance"] = this.instance;
        return data;
    }
}

export interface IProblemDetails {
    type?: string | undefined;
    title?: string | undefined;
    status?: number | undefined;
    detail?: string | undefined;
    instance?: string | undefined;
}

export class AddTrackedGameCommand implements IAddTrackedGameCommand {
    remoteUserId?: string;
    gameId?: number;
    hoursPlayed?: number;
    platform?: string;
    format?: GameFormat;
    status?: GameStatus;
    ownership?: GameOwnership;

    constructor(data?: IAddTrackedGameCommand) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.remoteUserId = _data["remoteUserId"];
            this.gameId = _data["gameId"];
            this.hoursPlayed = _data["hoursPlayed"];
            this.platform = _data["platform"];
            this.format = _data["format"];
            this.status = _data["status"];
            this.ownership = _data["ownership"];
        }
    }

    static fromJS(data: any): AddTrackedGameCommand {
        data = typeof data === 'object' ? data : {};
        let result = new AddTrackedGameCommand();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["remoteUserId"] = this.remoteUserId;
        data["gameId"] = this.gameId;
        data["hoursPlayed"] = this.hoursPlayed;
        data["platform"] = this.platform;
        data["format"] = this.format;
        data["status"] = this.status;
        data["ownership"] = this.ownership;
        return data;
    }
}

export interface IAddTrackedGameCommand {
    remoteUserId?: string;
    gameId?: number;
    hoursPlayed?: number;
    platform?: string;
    format?: GameFormat;
    status?: GameStatus;
    ownership?: GameOwnership;
}

export enum GameFormat {
    Digital = 0,
    Physical = 1,
    Subscription = 2,
}

export enum GameStatus {
    Current = 0,
    Playing = 1,
    Paused = 2,
    Planning = 3,
}

export enum GameOwnership {
    Owned = 0,
    Loan = 1,
    Wishlist = 2,
}

export class GetGameResult implements IGetGameResult {
    id?: number;
    coverImageURL?: string;
    title?: string;
    summary?: string;
    rating?: number;
    platforms?: string[];
    companies?: string[];

    constructor(data?: IGetGameResult) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.coverImageURL = _data["coverImageURL"];
            this.title = _data["title"];
            this.summary = _data["summary"];
            this.rating = _data["rating"];
            if (Array.isArray(_data["platforms"])) {
                this.platforms = [] as any;
                for (let item of _data["platforms"])
                    this.platforms!.push(item);
            }
            if (Array.isArray(_data["companies"])) {
                this.companies = [] as any;
                for (let item of _data["companies"])
                    this.companies!.push(item);
            }
        }
    }

    static fromJS(data: any): GetGameResult {
        data = typeof data === 'object' ? data : {};
        let result = new GetGameResult();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["coverImageURL"] = this.coverImageURL;
        data["title"] = this.title;
        data["summary"] = this.summary;
        data["rating"] = this.rating;
        if (Array.isArray(this.platforms)) {
            data["platforms"] = [];
            for (let item of this.platforms)
                data["platforms"].push(item);
        }
        if (Array.isArray(this.companies)) {
            data["companies"] = [];
            for (let item of this.companies)
                data["companies"].push(item);
        }
        return data;
    }
}

export interface IGetGameResult {
    id?: number;
    coverImageURL?: string;
    title?: string;
    summary?: string;
    rating?: number;
    platforms?: string[];
    companies?: string[];
}

export class SearchGamesResult implements ISearchGamesResult {
    games?: SearchGameResult[];

    constructor(data?: ISearchGamesResult) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            if (Array.isArray(_data["games"])) {
                this.games = [] as any;
                for (let item of _data["games"])
                    this.games!.push(SearchGameResult.fromJS(item));
            }
        }
    }

    static fromJS(data: any): SearchGamesResult {
        data = typeof data === 'object' ? data : {};
        let result = new SearchGamesResult();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (Array.isArray(this.games)) {
            data["games"] = [];
            for (let item of this.games)
                data["games"].push(item.toJSON());
        }
        return data;
    }
}

export interface ISearchGamesResult {
    games?: SearchGameResult[];
}

export class SearchGameResult implements ISearchGameResult {
    id?: number;
    title?: string;
    platforms?: string[];

    constructor(data?: ISearchGameResult) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.title = _data["title"];
            if (Array.isArray(_data["platforms"])) {
                this.platforms = [] as any;
                for (let item of _data["platforms"])
                    this.platforms!.push(item);
            }
        }
    }

    static fromJS(data: any): SearchGameResult {
        data = typeof data === 'object' ? data : {};
        let result = new SearchGameResult();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["title"] = this.title;
        if (Array.isArray(this.platforms)) {
            data["platforms"] = [];
            for (let item of this.platforms)
                data["platforms"].push(item);
        }
        return data;
    }
}

export interface ISearchGameResult {
    id?: number;
    title?: string;
    platforms?: string[];
}

export class RegisterUserCommand implements IRegisterUserCommand {
    remoteUserId?: string;
    email?: string;
    userName?: string;

    constructor(data?: IRegisterUserCommand) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.remoteUserId = _data["remoteUserId"];
            this.email = _data["email"];
            this.userName = _data["userName"];
        }
    }

    static fromJS(data: any): RegisterUserCommand {
        data = typeof data === 'object' ? data : {};
        let result = new RegisterUserCommand();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["remoteUserId"] = this.remoteUserId;
        data["email"] = this.email;
        data["userName"] = this.userName;
        return data;
    }
}

export interface IRegisterUserCommand {
    remoteUserId?: string;
    email?: string;
    userName?: string;
}

export class CheckUserExistResult implements ICheckUserExistResult {
    isUserNameTaken?: boolean;
    isEmailTaken?: boolean;

    constructor(data?: ICheckUserExistResult) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.isUserNameTaken = _data["isUserNameTaken"];
            this.isEmailTaken = _data["isEmailTaken"];
        }
    }

    static fromJS(data: any): CheckUserExistResult {
        data = typeof data === 'object' ? data : {};
        let result = new CheckUserExistResult();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["isUserNameTaken"] = this.isUserNameTaken;
        data["isEmailTaken"] = this.isEmailTaken;
        return data;
    }
}

export interface ICheckUserExistResult {
    isUserNameTaken?: boolean;
    isEmailTaken?: boolean;
}

export class CheckUserExistQuery implements ICheckUserExistQuery {
    userName?: string;
    email?: string;

    constructor(data?: ICheckUserExistQuery) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.userName = _data["userName"];
            this.email = _data["email"];
        }
    }

    static fromJS(data: any): CheckUserExistQuery {
        data = typeof data === 'object' ? data : {};
        let result = new CheckUserExistQuery();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["userName"] = this.userName;
        data["email"] = this.email;
        return data;
    }
}

export interface ICheckUserExistQuery {
    userName?: string;
    email?: string;
}

export class BackendAPIResponse<TResult> {
    status: number;
    headers: { [key: string]: any; };
    result: TResult;

    constructor(status: number, headers: { [key: string]: any; }, result: TResult)
    {
        this.status = status;
        this.headers = headers;
        this.result = result;
    }
}

export class BackendAPIException extends Error {
    override message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isBackendAPIException = true;

    static isBackendAPIException(obj: any): obj is BackendAPIException {
        return obj.isBackendAPIException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    if (result !== null && result !== undefined)
        throw result;
    else
        throw new BackendAPIException(message, status, response, headers, null);
}