#!/usr/bin/env python3
"""
Worldwide Engineering University Question ML Module
Trained on prestigious engineering questions from MIT, Stanford, Oxford, Cambridge, ETH Zurich, IITs, etc.
Performs semantic analysis, repetition prediction, and novelty assessment.
"""

import sys
import os
import json
import re
import argparse
import math

# Fallback TF-IDF and Cosine Similarity implementation in pure Python
# to ensure 100% runtime reliability even if scikit-learn is not installed.
class PurePythonNLP:
    def __init__(self):
        self.vocabulary = {}
        self.idf = {}
        self.num_documents = 0
        self.corpus_terms = []

    def _tokenize(self, text):
        # Normalize and tokenize text
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s-]', '', text)
        words = [w for w in text.split() if len(w) > 2]
        # Simple stop words filter
        stopwords = {
            'the', 'and', 'are', 'for', 'from', 'with', 'that', 'this', 'about', 'their',
            'what', 'explain', 'detail', 'difference', 'between', 'how', 'show', 'compare',
            'design', 'derive', 'state', 'prove', 'analyze', 'determine', 'formulate'
        }
        return [w for w in words if w not in stopwords]

    def fit(self, documents):
        self.num_documents = len(documents)
        doc_tokens = [self._tokenize(doc) for doc in documents]
        
        # Build vocabulary
        vocab_set = set()
        for tokens in doc_tokens:
            vocab_set.update(tokens)
        
        self.vocabulary = {word: idx for idx, word in enumerate(sorted(list(vocab_set)))}
        
        # Calculate IDF
        word_doc_counts = {word: 0 for word in self.vocabulary}
        for tokens in doc_tokens:
            unique_tokens = set(tokens)
            for token in unique_tokens:
                if token in word_doc_counts:
                    word_doc_counts[token] += 1
        
        for word, count in word_doc_counts.items():
            # IDF with smoothing
            self.idf[word] = math.log((1 + self.num_documents) / (1 + count)) + 1

    def transform(self, document):
        tokens = self._tokenize(document)
        tf = {}
        for token in tokens:
            if token in self.vocabulary:
                tf[token] = tf.get(token, 0) + 1
        
        vector = [0.0] * len(self.vocabulary)
        for word, freq in tf.items():
            idx = self.vocabulary[word]
            vector[idx] = freq * self.idf[word]
            
        # L2 Normalization
        magnitude = math.sqrt(sum(val ** 2 for val in vector))
        if magnitude > 0:
            vector = [val / magnitude for val in vector]
            
        return vector

    def cosine_similarity(self, vec1, vec2):
        dot_product = sum(v1 * v2 for v1, v2 in zip(vec1, vec2))
        return dot_product

# Check if scikit-learn is available to use high-performance vectorized libraries
HAS_SKLEARN = False
try:
    import numpy as np
    import pandas as pd
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    pass

def load_corpus():
    # Load worldwide engineering corpus
    script_dir = os.path.dirname(os.path.abspath(__file__))
    corpus_path = os.path.join(script_dir, 'worldwide_corpus.json')
    if not os.path.exists(corpus_path):
        # Fallback to an empty list or create basic records
        return []
    with open(corpus_path, 'r', encoding='utf-8') as f:
        return json.load(f)

COMMON_ACADEMIC_WORDS = {
    'explain', 'discuss', 'describe', 'define', 'state', 'list', 'name', 'illustrate', 'compare', 'contrast',
    'difference', 'between', 'concept', 'working', 'principle', 'architecture', 'structure', 'design',
    'advantages', 'disadvantages', 'applications', 'write', 'short', 'note', 'briefly', 'sketch', 'diagram',
    'derivation', 'derive', 'equation', 'mathematical', 'formulate', 'turing', 'machine', 'proof', 'prove',
    'optimization', 'optimize', 'performance', 'efficiency', 'characteristics', 'features', 'functioning',
    'components', 'elements', 'process', 'operation', 'methods', 'methodology', 'techniques', 'properties',
    'advantages', 'benefits', 'challenges', 'limitations', 'drawbacks', 'merits', 'demerits', 'role', 'importance',
    'significance', 'need', 'purpose', 'objective', 'function', 'functions', 'use', 'uses', 'used', 'using',
    'various', 'different', 'following', 'given', 'below', 'above', 'brief', 'detailed', 'analysis', 'analyze',
    'evaluation', 'evaluate', 'critical', 'critically', 'respect', 'regard', 'context', 'example', 'examples',
    'instance', 'instances', 'with', 'without', 'about', 'under', 'over', 'into', 'onto', 'from', 'through',
    'implementation', 'implement', 'execution', 'execute', 'development', 'develop', 'phases', 'lifecycle',
    'models', 'model', 'approach', 'system', 'systems', 'problem', 'problems', 'solution', 'solutions',
    'algorithm', 'algorithms', 'complexity', 'space', 'time', 'cases', 'case', 'scenario', 'scenarios',
    'question', 'questions', 'answer', 'answers', 'marks', 'weightage', 'repetition', 'novelty'
}

STOP_WORDS_SET = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'dont', 'down', 'during', 'each', 'few',
    'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
    'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just',
    'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
    'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'should', 'so', 'some', 'such', 'than',
    'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
    'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
    'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',
    'yourself', 'yourselves'
}

TECHNICAL_WORDS = {
    'network', 'tcp', 'ip', 'protocol', 'layer', 'router', 'switch', 'routing', 'packet', 'ethernet', 'bandwidth', 'latency', 'socket', 'http', 'dns', 'udp', 'icmp', 'subnet', 'osi', 'transmission', 'handshake', 'port',
    'database', 'dbms', 'sql', 'query', 'normalization', 'normal form', 'transaction', 'acid', 'index', 'key', 'relation', 'table', 'schema', 'join', 'foreign', 'primary', 'lock', 'serializability', 'concurrency', 'nosql', 'relational', '1nf', '2nf', '3nf', 'bcnf',
    'operating', 'system', 'process', 'thread', 'memory', 'paging', 'segmentation', 'scheduler', 'scheduling', 'deadlock', 'mutex', 'semaphore', 'kernel', 'syscall', 'cpu', 'virtual', 'cache', 'fork', 'interrupt', 'synchronization', 'page replacement', 'critical section', 'sjf', 'fcfs',
    'software', 'design', 'uml', 'pattern', 'agile', 'scrum', 'requirements', 'testing', 'architecture', 'refactoring', 'lifecycle', 'diagram', 'git', 'ci/cd', 'sprint', 'coupling', 'cohesion', 'gantt', 'waterfall',
    'ai', 'ml', 'heuristic', 'neural', 'backpropagation', 'learning', 'supervised', 'unsupervised', 'regression', 'classification', 'clustering', 'dataset', 'gradient descent', 'bayes',
    'cloud', 'vm', 'virtualization', 'hypervisor', 'aws', 'docker', 'kubernetes', 'scaling', 'saas', 'paas', 'iaas', 'distributed', 'serverless', 'provisioning', 'tenant', 'elastic',
    'security', 'cyber', 'cryptography', 'cryptographic', 'cipher', 'encrypt', 'decrypt', 'signature', 'hash', 'des', 'aes', 'rsa', 'firewall', 'vulnerability', 'attack', 'ssl', 'tls', 'certificate', 'authentication'
}

CS_SPECIFIC_DICTIONARY = {
    'computer', 'science', 'engineering', 'programming', 'code', 'binary', 'matrix', 'array', 'variable', 'object', 'class', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'compiler', 'interpreter', 'link', 'list', 'tree', 'graph', 'stack', 'queue', 'heap', 'hashing', 'search', 'sort', 'recursion', 'iteration', 'pointer', 'reference', 'allocation', 'deallocation', 'garbage', 'collection', 'exception', 'handling', 'framework', 'library', 'module', 'package', 'interface', 'abstract', 'virtual', 'override', 'overload', 'constructor', 'destructor', 'static', 'final', 'const', 'let', 'var', 'method', 'parameter', 'argument', 'return', 'value', 'type', 'subtype', 'generic', 'template', 'iterator', 'stream', 'concurrency', 'asynchronous', 'synchronous', 'blocking', 'non-blocking', 'event', 'loop', 'callback', 'promise', 'future', 'reactive', 'functional', 'declarative', 'imperative', 'procedural', 'structural', 'aspect-oriented', 'domain-specific', 'markup', 'stylesheet', 'row', 'column', 'field', 'record', 'candidate', 'super', 'composite', 'surrogate', 'alternate', 'unique', 'check', 'default', 'null', 'not', 'cascade', 'restrict', 'no', 'action', 'inner', 'left', 'right', 'full', 'cross', 'natural', 'outer', 'self', 'union', 'intersect', 'except', 'select', 'project', 'rename', 'cartesian', 'product', 'division', 'aggregate', 'group', 'by', 'having', 'order', 'asc', 'desc', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'truncate', 'grant', 'revoke', 'commit', 'rollback', 'savepoint', 'atomicity', 'consistency', 'isolation', 'durability', 'shared', 'exclusive', 'intent', 'prevention', 'avoidance', 'recovery', 'log-based', 'shadow', 'checkpoint', 'buffer', 'manager', 'storage', 'file', 'organization', 'indexing', 'b-tree', 'b+-tree', 'extendible', 'linear', 'processing', 'cost-based', 'heuristics', 'relational', 'algebra', 'calculus', 'tuple', 'domain', 'functional', 'dependency', 'trivial', 'non-trivial', 'closure', 'canonical', 'cover', 'lossless', 'preserving', 'normal', 'form', '4nf', '5nf', 'multivalued', 'denormalization', 'nosql', 'key-value', 'document', 'column-family', 'cap', 'theorem', 'availability', 'partition', 'tolerance', 'base', 'basically', 'available', 'soft', 'eventual', 'mongodb', 'redis', 'cassandra', 'neo4j', 'hbase', 'hive', 'pig', 'spark', 'hadoop', 'mapreduce', 'yarn', 'hdfs', 'gfs', 'bigtable', 'spanner', 'dynamodb', 'aurora', 'rds', 's3', 'ec2', 'lambda', 'virtualization', 'type-1', 'type-2', 'xen', 'kvm', 'vmware', 'virtualbox', 'orchestration', 'pod', 'service', 'deployment', 'replica', 'ingress', 'configmap', 'secret', 'volume', 'persistent', 'claim', 'helm', 'chart', 'istio', 'mesh', 'microservices', 'monolithic', 'soa', 'rest', 'soap', 'graphql', 'grpc', 'yaml', 'protobuf', 'serialization', 'deserialization', 'api', 'gateway', 'load', 'balancer', 'round-robin', 'least-connections', 'ip-hash', 'reverse', 'proxy', 'nginx', 'apache', 'iis', 'resolver', 'root', 'tld', 'authoritative', 'cname', 'mx', 'txt', 'ns', 'ttl', 'addressing', 'ipv4', 'ipv6', 'subnetting', 'cidr', 'mask', 'gateway', 'rip', 'ospf', 'bgp', 'ping', 'traceroute', 'arp', 'rarp', 'dhcp', 'http', 'https', 'symmetric', 'asymmetric', 'public', 'private', 'encryption', 'decryption', 'caesar', 'vigenere', 'ecc', 'diffie-hellman', 'md5', 'sha-1', 'sha-256', 'sha-3', 'hmac', 'authority', 'pki', 'handshake', 'filtering', 'stateful', 'inspection', 'ids', 'ips', 'vpn', 'ipsec', 'openvpn', 'wireguard', 'ssh', 'sftp', 'ftp', 'smtp', 'pop3', 'imap', 'telnet', 'snmp', 'ntp', 'syslog', 'operating', 'monolithic', 'microkernel', 'hybrid', 'shell', 'bash', 'zsh', 'cmd', 'powershell', 'state', 'transition', 'pcb', 'tcb', 'context', 'switch', 'scheduling', 'srtf', 'priority', 'multilevel', 'feedback', 'inter-process', 'communication', 'ipc', 'pipe', 'fifo', 'message', 'passing', 'monitor', 'synchronization', 'race', 'condition', 'peterson', 'bakery', 'test-and-set', 'compare-and-swap', 'mutual', 'exclusion', 'hold', 'wait', 'preemption', 'circular', 'resource', 'allocation', 'banker', 'safety', 'logical', 'physical', 'address', 'mmu', 'relocation', 'register', 'swapping', 'contiguous', 'fragmentation', 'internal', 'external', 'page', 'tlb', 'translation', 'lookaside', 'hierarchical', 'inverted', 'virtual', 'demand', 'fault', 'optimal', 'belady', 'anomaly', 'thrashing', 'model', 'directory', 'linked', 'fat', 'ntfs', 'ext4', 'ufs', 'inode', 'free', 'bit', 'vector', 'grouping', 'counting', 'hardware', 'bus', 'controller', 'polling', 'interrupts', 'dma', 'direct', 'subsystem', 'buffering', 'caching', 'spooling', 'device', 'drivers', 'disk', 'sstf', 'scan', 'c-scan', 'look', 'c-look', 'raid', 'levels', 'striping', 'mirroring', 'parity', 'sdt', 'sdlc', 'spiral', 'v-model', 'agile', 'scrum', 'kanban', 'xp', 'devops', 'requirements', 'elicitation', 'specification', 'srs', 'validation', 'actor', 'boundary', 'relationship', 'include', 'extend', 'generalization', 'uml', 'unified', 'modeling', 'language', 'attribute', 'visibility', 'association', 'aggregation', 'composition', 'multiplicity', 'sequence', 'lifeline', 'activation', 'statechart', 'activity', 'swimlane', 'architectural', 'patterns', 'layered', 'peer-to-peer', 'event-driven', 'mvc', 'design', 'singleton', 'factory', 'builder', 'prototype', 'structural', 'adapter', 'bridge', 'decorator', 'facade', 'flyweight', 'behavioral', 'chain', 'of', 'responsibility', 'memento', 'observer', 'strategy', 'visitor', 'coupling', 'cohesion', 'low', 'high', 'testing', 'verification', 'white-box', 'black-box', 'grey-box', 'unit', 'integration', 'acceptance', 'regression', 'performance', 'load', 'stress', 'usability', 'compatibility', 'reliability', 'scalability', 'maintainability', 'portability', 'test', 'equivalence', 'partitioning', 'path', 'cyclomatic', 'basis', 'loop', 'flow', 'mutation', 'automation', 'frameworks', 'junit', 'testng', 'selenium', 'cucumber', 'pytest', 'quality', 'assurance', 'sqa', 'iso', '9001', 'cmmi', 'six', 'sigma', 'metrics', 'loc', 'points', 'cocomo', 'effort', 'estimation', 'schedule', 'cost', 'risk', 'identification', 'planning', 'monitoring', 'mitigation', 'version', 'control', 'git', 'svn', 'cvs', 'repository', 'branch', 'merge', 'rebase', 'pull', 'request', 'clone', 'stash', 'tag', 'conflict', 'resolution', 'refactoring', 'smells', 'duplicate', 'large', 'parameter', 'divergent', 'change', 'shotgun', 'surgery', 'feature', 'envy', 'data', 'clumps', 'primitive', 'obsession', 'statements', 'lazy', 'speculative', 'generality', 'temporary', 'chains', 'middle', 'man', 'inappropriate', 'intimacy', 'alternative', 'classes', 'interfaces', 'incomplete', 'bequest', 'comments', 'extract', 'inline', 'move', 'rename', 'replace', 'temp', 'query', 'magic', 'number', 'symbolic', 'constant', 'decompose', 'conditional', 'consolidate', 'expression', 'fragments', 'remove', 'nested', 'guard', 'clauses', 'polymorphism', 'introduce', 'assertion', 'artificial', 'intelligence', 'ai', 'machine', 'learning', 'ml', 'deep', 'dl', 'nlp', 'natural', 'language', 'processing', 'computer', 'vision', 'cv', 'robotics', 'expert', 'fuzzy', 'genetic', 'supervised', 'unsupervised', 'reinforcement', 'semi-supervised', 'self-supervised', 'active', 'transfer', 'ensemble', 'bagging', 'boosting', 'stacking', 'random', 'forest', 'gradient', 'boosting', 'xgboost', 'lightgbm', 'catboost', 'adaboost', 'decision', 'tree', 'information', 'gain', 'entropy', 'gini', 'impurity', 'variance', 'reduction', 'pruning', 'linear', 'regression', 'least', 'squares', 'stochastic', 'mini-batch', 'rate', 'epochs', 'convergence', 'overfitting', 'underfitting', 'bias-variance', 'tradeoff', 'regularization', 'l1', 'lasso', 'l2', 'ridge', 'elastic', 'net', 'logistic', 'sigmoid', 'odds', 'ratio', 'logit', 'cross-entropy', 'loss', 'support', 'vector', 'svm', 'hyperplane', 'margin', 'soft', 'kernel', 'trick', 'polynomial', 'rbf', 'vectors', 'k-nearest', 'neighbors', 'knn', 'distance', 'euclidean', 'manhattan', 'minkowski', 'cosine', 'naive', 'bayes', 'classifier', 'prior', 'probability', 'likelihood', 'posterior', 'laplace', 'smoothing', 'clustering', 'k-means', 'centroids', 'inertia', 'elbow', 'silhouette', 'coefficient', 'agglomerative', 'divisive', 'dendrogram', 'dbscan', 'eps', 'min_samples', 'core', 'border', 'noise', 'reduction', 'pca', 'principal', 'eigenvalues', 'eigenvectors', 'covariance', 'explained', 'tsne', 'lda', 'neural', 'networks', 'perceptron', 'activation', 'step', 'tanh', 'relu', 'leaky', 'elu', 'selu', 'gelu', 'swish', 'softmax', 'multi-layer', 'mlp', 'feedforward', 'backpropagation', 'chain', 'rule', 'mse', 'mae', 'huber', 'optimizers', 'momentum', 'nesterov', 'adagrad', 'adadelta', 'rmsprop', 'adam', 'adamw', 'decay', 'scheduler', 'vanishing', 'exploding', 'batch', 'normalization', 'layer', 'dropout', 'early', 'stopping', 'convolutional', 'convolution', 'filter', 'stride', 'padding', 'valid', 'same', 'pooling', 'max', 'average', 'flatten', 'fully', 'connected', 'dense', 'recurrent', 'rnn', 'hidden', 'sequence-to-sequence', 'lstm', 'long', 'short-term', 'gate', 'forget', 'cell', 'gru', 'gated', 'reset', 'update', 'bidirectional', 'attention', 'mechanism', 'self-attention', 'scaled', 'dot-product', 'multi-head', 'transformer', 'encoder', 'decoder', 'positional', 'encoding', 'bert', 'gpt', 't5', 'large', 'llm', 'generative', 'fine-tuning', 'rlhf', 'evaluation', 'accuracy', 'precision', 'recall', 'f1-score', 'confusion', 'tp', 'fp', 'fn', 'tn', 'roc', 'auc', 'cross-validation', 'k-fold', 'stratified', 'leave-one-out', 'train-test', 'split', 'hyperparameter', 'tuning', 'grid', 'optuna'
}

VALID_DICT = STOP_WORDS_SET.union(COMMON_ACADEMIC_WORDS).union(TECHNICAL_WORDS).union(CS_SPECIFIC_DICTIONARY)

COMMON_ENGLISH_WORDS = {
    'with', 'without', 'about', 'under', 'over', 'into', 'onto', 'from', 'through', 'between', 'during', 'before', 'after',
    'above', 'below', 'under', 'upon', 'within', 'without', 'behind', 'beside', 'beyond', 'against', 'towards', 'among',
    'throughout', 'despite', 'concerning', 'regarding', 'including', 'excluding', 'for', 'of', 'in', 'on', 'at', 'by',
    'multiple', 'single', 'double', 'triple', 'several', 'various', 'different', 'some', 'any', 'every', 'each', 'all',
    'none', 'both', 'either', 'neither', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'last', 'next', 'previous',
    'bad', 'good', 'better', 'best', 'worst', 'poor', 'high', 'low', 'large', 'small', 'great', 'little', 'few', 'many',
    'much', 'more', 'less', 'least', 'most', 'some', 'any', 'no', 'not', 'only', 'just', 'very', 'too', 'quite', 'rather',
    'fluid', 'flow', 'mechanics', 'incompressible', 'compressible', 'velocity', 'pressure', 'density', 'viscosity',
    'navier', 'stokes', 'navier-stokes', 'fourier', 'laplace', 'lagrange', 'euler', 'newton', 'maxwell', 'bernoulli',
    'boltzmann', 'schrodinger', 'einstein', 'heisenberg', 'plank', 'bohr', 'fermi', 'dirac', 'feynman', 'tesla',
    'steady', 'unsteady', 'laminar', 'turbulent', 'boundary', 'layer', 'shear', 'stress', 'strain', 'elastic',
    'plastic', 'deformation', 'tension', 'compression', 'torque', 'moment', 'force', 'mass', 'weight', 'gravity',
    'acceleration', 'momentum', 'energy', 'work', 'power', 'efficiency', 'entropy', 'enthalpy', 'temperature',
    'heat', 'conduction', 'convection', 'radiation', 'thermodynamics', 'combustion', 'cycle', 'carnot', 'rankine',
    'otto', 'diesel', 'brayton', 'refrigeration', 'pump', 'turbine', 'compressor', 'nozzle', 'diffuser', 'valve',
    'pipe', 'channel', 'duct', 'conduit', 'reservoir', 'tank', 'cylinder', 'composite', 'wall', 'slab', 'sphere',
    'fin', 'extended', 'surface', 'transient', 'steady-state', 'dimensionless', 'numbers', 'reynolds', 'prandtl',
    'nusselt', 'grashof', 'peclet', 'stanton', 'schmidt', 'lewis', 'sherwood', 'biot', 'fourier', 'number',
    'friction', 'factor', 'drag', 'lift', 'drag-coefficient', 'lift-coefficient', 'aerodynamics', 'hydrodynamics'
}

VALID_DICT = VALID_DICT.union(COMMON_ENGLISH_WORDS)

phrases = list(VALID_DICT)
for p in phrases:
    for word in p.split():
        VALID_DICT.add(word)

def count_spelling_errors(text):
    words = re.sub(r'[^\w\s-]', ' ', text.lower()).split()
    words = [w for w in words if len(w) > 2 and not w.isdigit() and not re.match(r'^[a-z]$', w)]
    
    errors = set()
    for w in words:
        clean_w = w.strip('-_')
        if not clean_w or clean_w in VALID_DICT:
            continue
        
        base = clean_w
        variations = [
            re.sub(r's$', '', base),
            re.sub(r'es$', '', base),
            re.sub(r'ed$', '', base),
            re.sub(r'ing$', '', base),
            re.sub(r'ly$', '', base),
            re.sub(r'tion$', '', base),
            re.sub(r'ation$', '', base),
            re.sub(r'ment$', '', base),
            re.sub(r'ability$', '', base),
            re.sub(r'ible$', '', base),
            re.sub(r'able$', '', base)
        ]
        
        found = False
        for v in variations:
            if len(v) > 2 and v in VALID_DICT:
                found = True
                break
        if not found:
            errors.add(clean_w)
            
    return list(errors)

def is_gibberish(text):
    cleaned = text.strip()
    if len(cleaned) < 15:
        return True
    
    # Clean text to words
    words = re.sub(r'[^a-zA-Z\s]', ' ', cleaned).lower().split()
    words = [w for w in words if len(w) > 0]
    if len(words) < 4:
        return True
    
    gibberish_words = 0
    for word in words:
        if len(word) > 4:
            # Check vowel existence
            has_vowel = any(c in 'aeiouy' for c in word)
            if not has_vowel:
                gibberish_words += 1
                continue
            # Check excessive repeating consonants (4+ in a row)
            if re.search(r'[bcdfghjklmnpqrstvwxz]{4,}', word):
                gibberish_words += 1
                
    if gibberish_words > len(words) / 2:
        return True
    return False

def get_topic_name(code):
    if not code:
        return ''
    code_upper = str(code).upper()
    if 'CS601' in code_upper or 'CS-301' in code_upper:
        return 'Computer Networks'
    elif 'CS602' in code_upper or 'CS-302' in code_upper or 'DBMS' in code_upper:
        return 'Database Management Systems'
    elif 'CS603' in code_upper or 'CS-303' in code_upper:
        return 'Operating Systems'
    elif 'CS604' in code_upper or 'SE' in code_upper or 'SOFTWARE' in code_upper:
        return 'Software Engineering'
    elif 'CS605' in code_upper or 'CS-411' in code_upper or 'AI' in code_upper or 'ML' in code_upper:
        return 'Artificial Intelligence'
    elif 'CS651' in code_upper or 'CLOUD' in code_upper:
        return 'Cloud Computing'
    elif 'CS652' in code_upper or 'CS-352' in code_upper or 'CYBER' in code_upper or 'SECURITY' in code_upper:
        return 'Cyber Security'
    return ''

def check_topic_relevance(text, topic_name):
    if not topic_name:
        return True, "No topic name provided for relevance audit."
    
    lower_text = text.lower()
    lower_topic = topic_name.lower()
    
    topic_vocabularies = {
        'computer networks': ['network', 'tcp', 'ip', 'protocol', 'layer', 'router', 'switch', 'routing', 'packet', 'ethernet', 'bandwidth', 'latency', 'socket', 'http', 'dns', 'udp', 'icmp', 'subnet', 'osi', 'transmission', 'handshake', 'port'],
        'database management systems': ['database', 'dbms', 'sql', 'query', 'normalization', 'normal form', 'transaction', 'acid', 'index', 'key', 'relation', 'table', 'schema', 'join', 'foreign', 'primary', 'lock', 'serializability', 'concurrency', 'nosql', 'relational', '1nf', '2nf', '3nf', 'bcnf'],
        'operating systems': ['operating', 'system', 'process', 'thread', 'memory', 'paging', 'segmentation', 'scheduler', 'scheduling', 'deadlock', 'mutex', 'semaphore', 'kernel', 'syscall', 'cpu', 'virtual', 'cache', 'fork', 'interrupt', 'synchronization', 'page replacement', 'critical section', 'sjf', 'fcfs'],
        'software engineering': ['software', 'design', 'uml', 'pattern', 'agile', 'scrum', 'requirements', 'testing', 'architecture', 'refactoring', 'lifecycle', 'diagram', 'git', 'ci/cd', 'sprint', 'coupling', 'cohesion', 'gantt', 'waterfall'],
        'artificial intelligence': ['ai', 'ml', 'heuristic', 'neural', 'backpropagation', 'learning', 'supervised', 'unsupervised', 'regression', 'classification', 'clustering', 'dataset', 'gradient descent', 'bayes'],
        'cloud computing': ['cloud', 'vm', 'virtualization', 'hypervisor', 'aws', 'docker', 'kubernetes', 'scaling', 'saas', 'paas', 'iaas', 'distributed', 'serverless', 'provisioning', 'tenant', 'elastic'],
        'cyber security': ['security', 'cyber', 'cryptography', 'cryptographic', 'cipher', 'encrypt', 'decrypt', 'signature', 'hash', 'des', 'aes', 'rsa', 'firewall', 'vulnerability', 'attack', 'ssl', 'tls', 'certificate', 'authentication']
    }
    
    matched_vocab_key = ''
    for key in topic_vocabularies:
        if key in lower_topic:
            matched_vocab_key = key
            break
            
    if not matched_vocab_key:
        topic_tokens = [w for w in lower_topic.split() if len(w) > 3]
        has_overlap = any(token in lower_text for token in topic_tokens)
        return True, "Generic topic checked via direct token mapping."
        
    selected_vocab = topic_vocabularies[matched_vocab_key]
    matches = [word for word in selected_vocab if word in lower_text]
    
    if len(matches) > 0:
        return True, f"Topic match confirmed via keywords: [{', '.join(matches[:3])}]"
        
    other_topic_matched = ''
    for key in topic_vocabularies:
        if key != matched_vocab_key:
            other_vocab = topic_vocabularies[key]
            other_matches = [word for word in other_vocab if word in lower_text]
            if len(other_matches) >= 2:
                other_topic_matched = key
                break
                
    if other_topic_matched:
        return False, f"Topic drift: Question seems to belong to '{other_topic_matched}' rather than '{matched_vocab_key}'."
        
    return False, f"No standard vocabulary keywords found for topic '{matched_vocab_key}'."

def run_predictions_sklearn(student_questions, global_corpus):
    # ML Engine with Scikit-learn
    corpus_texts = [q['text'] for q in global_corpus]
    
    vectorizer = TfidfVectorizer(stop_words='english')
    # Fit on global corpus texts
    tfidf_matrix = vectorizer.fit_transform(corpus_texts)
    
    analyzed_questions = []
    
    for sq in student_questions:
        sq_text = sq.get('text', '')
        
        # 1. Validity Check
        if is_gibberish(sq_text):
            analyzed_questions.append({
                **sq,
                'mlRepetitionProbability': 0.0,
                'mlNoveltyRating': 0.0,
                'mlMatchedUniversity': "Gibberish Validation Engine",
                'mlMatchedScore': 0.0,
                'mlPredictedDifficulty': 'easy',
                'creditLevel': 0
            })
            continue

        # Check simple recall/definition question patterns (e.g. "What is...", "Define...", with <= 6 words)
        is_simple_definition = False
        words_count = len(sq_text.split())
        if re.search(r'^(what is|define|state|list|name)\b', sq_text.lower().strip()) and words_count <= 6:
            is_simple_definition = True

        # Get topic relevance
        sq_code = sq.get('code', '')
        topic_name = get_topic_name(sq_code)
        relevance_ok, relevance_msg = check_topic_relevance(sq_text, topic_name)
        relevance_error = not relevance_ok

        sq_vector = vectorizer.transform([sq_text])
        
        # Calculate Cosine Similarities against entire global corpus
        similarities = cosine_similarity(sq_vector, tfidf_matrix).flatten()
        
        best_match_idx = np.argmax(similarities)
        best_score = float(similarities[best_match_idx])
        
        if best_score > 0.05:
            matched_q = global_corpus[best_match_idx]
            source_uni = matched_q['sourceUniversity']
            ref_difficulty = matched_q['difficulty']
            ref_dept = matched_q['department']
        else:
            source_uni = "Global Reference Curriculum"
            ref_difficulty = sq.get('difficulty', 'medium')
            ref_dept = sq.get('department', 'Computer Science')
            
        # Calculate Repetition Probability based on Cosine Similarity
        # Max probability capped at 96% and min is based on content overlap
        base_rep = 45.0
        similarity_weight = best_score * 45.0 # Max +45% from worldwide matching
        
        # University prestige factor
        prestige_bonus = 0.0
        if "mit" in source_uni.lower() or "stanford" in source_uni.lower():
            prestige_bonus = 6.0
        elif "iit" in source_uni.lower() or "cambridge" in source_uni.lower() or "eth" in source_uni.lower():
            prestige_bonus = 4.0
            
        repetition_prob = min(base_rep + similarity_weight + prestige_bonus, 96.0)
        repetition_prob = round(repetition_prob, 1)
        
        # Novelty rating is inversely proportional to similarity
        # High similarity means low novelty.
        novelty_rating = (1.0 - best_score) * 100.0
        # Harder questions get a novelty boost
        if sq.get('difficulty') == 'hard' or sq.get('marks', 0) >= 12:
            novelty_rating += 10.0
        novelty_rating = min(max(novelty_rating, 5.0), 99.0)
        novelty_rating = round(novelty_rating, 1)
        
        # Simple domain and difficulty predictor logic
        pred_difficulty = ref_difficulty
        # Check text complexity cues
        lower_text = sq_text.lower()
        if any(w in lower_text for w in ['prove', 'design', 'turing', 'formulate', 'comprehensive', 'mechanics', 'navier-stokes']):
            pred_difficulty = 'hard'
        elif any(w in lower_text for w in ['define', 'what is', 'state', 'list', 'briefly']):
            pred_difficulty = 'easy'
            
        # Cognitive level calculation
        cognitive_level = 2
        if re.search(r'\b(design|derive|formulate|architect|synthesize|optimize|prove|turing machine|raft|consensus|cryptography|cryptographic|navier-stokes|quantum|compiler|distributed)\b', lower_text):
            cognitive_level = 5
        elif re.search(r'\b(analyze|compare|differentiate|implement|calculate|solve|derive|evaluate|investigate)\b', lower_text):
            cognitive_level = 4
        elif re.search(r'\b(explain|describe|discuss|illustrate|explain the difference)\b', lower_text):
            cognitive_level = 3
        elif re.search(r'\b(what is|state|define|list|identify|name|which)\b', lower_text):
            cognitive_level = 2
            
        if len(lower_text.split()) < 8:
            cognitive_level = min(cognitive_level, 2)
            
        credit_level = cognitive_level
        if best_score > 0.8:
            credit_level = 1
        elif best_score > 0.6:
            credit_level = min(credit_level, 2)
        elif best_score > 0.4:
            credit_level = min(credit_level, 3)
        elif best_score > 0.2:
            credit_level = max(1, min(credit_level, 4))
            
        if relevance_error:
            credit_level = 1
            novelty_rating = min(novelty_rating, 30.0) # cap novelty if out of topic
            
        if is_simple_definition:
            credit_level = 1
            novelty_rating = min(novelty_rating, 15.0)
            repetition_prob = max(repetition_prob, 88.0)
            
        # Spelling audit check
        spelling_errors = count_spelling_errors(sq_text)
        if len(spelling_errors) >= 3:
            credit_level = min(credit_level, 2)
            novelty_rating = min(novelty_rating, 25.0)

        analyzed_questions.append({
            **sq,
            'mlRepetitionProbability': repetition_prob,
            'mlNoveltyRating': novelty_rating,
            'mlMatchedUniversity': source_uni,
            'mlMatchedScore': round(best_score, 3),
            'mlPredictedDifficulty': pred_difficulty,
            'creditLevel': credit_level,
            'spellingErrors': spelling_errors
        })
        
    return analyzed_questions

def run_predictions_pure_python(student_questions, global_corpus):
    # ML Engine with Pure Python Fallback
    corpus_texts = [q['text'] for q in global_corpus]
    
    nlp = PurePythonNLP()
    nlp.fit(corpus_texts)
    
    global_vectors = [nlp.transform(doc) for doc in corpus_texts]
    
    analyzed_questions = []
    
    for sq in student_questions:
        sq_text = sq.get('text', '')
        
        # 1. Validity Check
        if is_gibberish(sq_text):
            analyzed_questions.append({
                **sq,
                'mlRepetitionProbability': 0.0,
                'mlNoveltyRating': 0.0,
                'mlMatchedUniversity': "Gibberish Validation Engine",
                'mlMatchedScore': 0.0,
                'mlPredictedDifficulty': 'easy',
                'creditLevel': 0
            })
            continue



        # Check simple recall/definition question patterns (e.g. "What is...", "Define...", with <= 6 words)
        is_simple_definition = False
        words_count = len(sq_text.split())
        if re.search(r'^(what is|define|state|list|name)\b', sq_text.lower().strip()) and words_count <= 6:
            is_simple_definition = True

        # Get topic relevance
        sq_code = sq.get('code', '')
        topic_name = get_topic_name(sq_code)
        relevance_ok, relevance_msg = check_topic_relevance(sq_text, topic_name)
        relevance_error = not relevance_ok

        sq_vector = nlp.transform(sq_text)
        
        best_score = 0.0
        best_match_idx = 0
        
        for idx, g_vec in enumerate(global_vectors):
            score = nlp.cosine_similarity(sq_vector, g_vec)
            if score > best_score:
                best_score = score
                best_match_idx = idx
                
        if best_score > 0.05:
            matched_q = global_corpus[best_match_idx]
            source_uni = matched_q['sourceUniversity']
            ref_difficulty = matched_q['difficulty']
            ref_dept = matched_q['department']
        else:
            source_uni = "Global Reference Curriculum"
            ref_difficulty = sq.get('difficulty', 'medium')
            ref_dept = sq.get('department', 'Computer Science')
            
        # Calculate Repetition Probability based on Cosine Similarity
        base_rep = 45.0
        similarity_weight = best_score * 45.0
        
        prestige_bonus = 0.0
        if "mit" in source_uni.lower() or "stanford" in source_uni.lower():
            prestige_bonus = 6.0
        elif "iit" in source_uni.lower() or "cambridge" in source_uni.lower() or "eth" in source_uni.lower():
            prestige_bonus = 4.0
            
        repetition_prob = min(base_rep + similarity_weight + prestige_bonus, 96.0)
        repetition_prob = round(repetition_prob, 1)
        
        # Novelty rating
        novelty_rating = (1.0 - best_score) * 100.0
        if sq.get('difficulty') == 'hard' or sq.get('marks', 0) >= 12:
            novelty_rating += 10.0
        novelty_rating = min(max(novelty_rating, 5.0), 99.0)
        novelty_rating = round(novelty_rating, 1)
        
        # Difficulty predictor logic
        pred_difficulty = ref_difficulty
        lower_text = sq_text.lower()
        if any(w in lower_text for w in ['prove', 'design', 'turing', 'formulate', 'comprehensive', 'mechanics', 'navier-stokes']):
            pred_difficulty = 'hard'
        elif any(w in lower_text for w in ['define', 'what is', 'state', 'list', 'briefly']):
            pred_difficulty = 'easy'
            
        # Cognitive level calculation
        cognitive_level = 2
        if re.search(r'\b(design|derive|formulate|architect|synthesize|optimize|prove|turing machine|raft|consensus|cryptography|cryptographic|navier-stokes|quantum|compiler|distributed)\b', lower_text):
            cognitive_level = 5
        elif re.search(r'\b(analyze|compare|differentiate|implement|calculate|solve|derive|evaluate|investigate)\b', lower_text):
            cognitive_level = 4
        elif re.search(r'\b(explain|describe|discuss|illustrate|explain the difference)\b', lower_text):
            cognitive_level = 3
        elif re.search(r'\b(what is|state|define|list|identify|name|which)\b', lower_text):
            cognitive_level = 2
            
        if len(lower_text.split()) < 8:
            cognitive_level = min(cognitive_level, 2)
            
        credit_level = cognitive_level
        if best_score > 0.8:
            credit_level = 1
        elif best_score > 0.6:
            credit_level = min(credit_level, 2)
        elif best_score > 0.4:
            credit_level = min(credit_level, 3)
        elif best_score > 0.2:
            credit_level = max(1, min(credit_level, 4))
            
        if relevance_error:
            credit_level = 1
            novelty_rating = min(novelty_rating, 30.0) # cap novelty if out of topic
            
        if is_simple_definition:
            credit_level = 1
            novelty_rating = min(novelty_rating, 15.0)
            repetition_prob = max(repetition_prob, 88.0)
            
        # Spelling audit check
        spelling_errors = count_spelling_errors(sq_text)
        if len(spelling_errors) >= 3:
            credit_level = min(credit_level, 2)
            novelty_rating = min(novelty_rating, 25.0)

        analyzed_questions.append({
            **sq,
            'mlRepetitionProbability': repetition_prob,
            'mlNoveltyRating': novelty_rating,
            'mlMatchedUniversity': source_uni,
            'mlMatchedScore': round(best_score, 3),
            'mlPredictedDifficulty': pred_difficulty,
            'creditLevel': credit_level,
            'spellingErrors': spelling_errors
        })
        
    return analyzed_questions

def main():
    parser = argparse.ArgumentParser(description="Worldwide Engineering Question ML Module (Python)")
    parser.add_argument('--action', type=str, required=True, choices=['analyze_trends', 'predict'], help='Action to perform')
    parser.add_argument('--input_file', type=str, default=None, help='JSON input file containing student questions')
    
    args = parser.parse_args()
    
    # Read questions from file or stdin
    student_questions = []
    if args.input_file:
        try:
            with open(args.input_file, 'r', encoding='utf-8') as f:
                student_questions = json.load(f)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Failed to read input file: {str(e)}"}))
            sys.exit(1)
    else:
        # Read from stdin
        try:
            input_data = sys.stdin.read()
            if input_data.strip():
                student_questions = json.loads(input_data)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Failed to read stdin: {str(e)}"}))
            sys.exit(1)
            
    if not student_questions:
        print(json.dumps({"success": False, "error": "No questions input data received."}))
        sys.exit(1)
        
    global_corpus = load_corpus()
    if not global_corpus:
        print(json.dumps({"success": False, "error": "Worldwide training corpus file is missing or empty."}))
        sys.exit(1)
        
    # Run prediction using SciPy/Sklearn or fallback to Pure Python
    try:
        if HAS_SKLEARN:
            results = run_predictions_sklearn(student_questions, global_corpus)
            engine = "scikit-learn (optimized)"
        else:
            results = run_predictions_pure_python(student_questions, global_corpus)
            engine = "pure-python (stable fallback)"
            
        output = {
            "success": True,
            "engine": engine,
            "trainingCorpusQuestions": len(global_corpus),
            "universitiesTrained": list(set(q['sourceUniversity'] for q in global_corpus)),
            "departmentsTrained": list(set(q['department'] for q in global_corpus)),
            "data": results
        }
        print(json.dumps(output))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": f"ML Engine runtime exception: {str(e)}"}))
        sys.exit(1)

if __name__ == '__main__':
    main()
