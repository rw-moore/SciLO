/**
 * @return {string}
 */
export default function GetInitial(user) {
	let F, L;
	if (user.first_name) {
		F = user.first_name[0].toUpperCase();
	}
	if (user.last_name) {
		L = user.last_name[0].toUpperCase();
	}
	return F + L;
}
