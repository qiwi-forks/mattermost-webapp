// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {connect} from 'react-redux';

import {GlobalState} from '@mattermost/types/store';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getChannel, getChannelModerations} from 'mattermost-redux/selectors/entities/channels';
import {getAllGroups, getGroupsAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';
import {getScheme} from 'mattermost-redux/selectors/entities/schemes';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {getScheme as loadScheme} from 'mattermost-redux/actions/schemes';
import {
    addChannelMember,
    deleteChannel,
    getChannel as fetchChannel,
    getChannelModerations as fetchChannelModerations,
    membersMinusGroupMembers,
    patchChannel,
    patchChannelModerations,
    removeChannelMember,
    unarchiveChannel,
    updateChannelMemberSchemeRoles,
    updateChannelPrivacy,
} from 'mattermost-redux/actions/channels';
import {getTeam as fetchTeam} from 'mattermost-redux/actions/teams';
import {
    getGroupsAssociatedToChannel as fetchAssociatedGroups,
    linkGroupSyncable,
    patchGroupSyncable,
    unlinkGroupSyncable,
} from 'mattermost-redux/actions/groups';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {LicenseSkus} from 'utils/constants';

import {setNavigationBlocked} from 'actions/admin_actions';

import ChannelDetails, {ChannelDetailsActions} from './channel_details';

type OwnProps = {
    match: {
        params: {
            channel_id: string;
        };
    };
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const license = getLicense(state);

    const isLicensed = true;

    // Channel Moderation is only available for Professional, Enterprise and backward compatible with E20
    const channelModerationEnabled = true;

    // Channel Groups is only available for Enterprise and backward compatible with E20
    const channelGroupsEnabled = isLicensed && (license.SkuShortName === LicenseSkus.Enterprise || license.SkuShortName === LicenseSkus.E20);

    const guestAccountsEnabled = config.EnableGuestAccounts === 'true';
    const channelID = ownProps.match.params.channel_id;
    const channel = getChannel(state, channelID) || {};
    const team = getTeam(state, channel.team_id) || {};
    const groups = getGroupsAssociatedToChannel(state, channelID);
    const totalGroups = groups.length;
    const allGroups = getAllGroups(state);
    const channelPermissions = getChannelModerations(state, channelID);
    const teamScheme = getScheme(state, team.scheme_id);
    return {
        channelID,
        channel,
        team,
        groups,
        totalGroups,
        allGroups,
        channelPermissions,
        teamScheme,
        guestAccountsEnabled,
        channelModerationEnabled,
        channelGroupsEnabled,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, ChannelDetailsActions>({
            getGroups: fetchAssociatedGroups,
            linkGroupSyncable,
            unlinkGroupSyncable,
            membersMinusGroupMembers,
            setNavigationBlocked: setNavigationBlocked as any,
            getChannel: fetchChannel,
            getTeam: fetchTeam,
            getChannelModerations: fetchChannelModerations,
            patchChannel,
            updateChannelPrivacy,
            patchGroupSyncable,
            patchChannelModerations,
            loadScheme,
            addChannelMember,
            removeChannelMember,
            updateChannelMemberSchemeRoles,
            deleteChannel,
            unarchiveChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetails);
