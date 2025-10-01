import axios from "axios";
import { useSecurityStore } from "../store/security";
import { useGlobalStore } from "../store/global";

axios.interceptors.request.use(
	function (config) {
		const security = useSecurityStore()
		const token = security.token
		if (token) config.headers.Authorization = `Bearer ${token}`;
		return config
	},
	function (error) {
		return Promise.reject(error)
	}
)


axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const security = useSecurityStore();
		const global = useGlobalStore();
		global.utl.hiddenLoader();

		if (typeof (error.response.data) != "object" || error.response.data.status == global.statusCodes.INTERNAL_SERVER_ERROR) {
			global.utl.genToast(global.tstType.SERVER_ERROR);
			return Promise.reject(error);
		}

		if ([global.statusCodes.FORBIDDEN, global.statusCodes.UNAUTHORIZED].includes(error.response.data.status)) {
			security.clear();
			global.utl.genToast(global.tstType.CORRUPTED_SESSION);
			global.utl.navigate('Auth');
		}

		return error.response;

	}
);
