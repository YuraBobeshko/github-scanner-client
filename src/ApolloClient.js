import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ApolloLink } from '@apollo/client';

const httpLink = createHttpLink({
    uri: 'http://localhost:4000/', // Ensure this is the correct URI for your GraphQL server
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('githubToken');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
    }
    if (networkError) {
        console.error(`[Network error]: ${networkError}`);
    }
});

const client = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink.concat(httpLink)]),
    cache: new InMemoryCache(),
});

export default client;
